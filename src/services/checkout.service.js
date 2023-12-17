'use strict';

const { Types } = require("mongoose");
const { NotFoundError, BadRequestError } = require("../core/error-response");
const { getUserCart, findProductInCartv2, deleteProductInCart } = require("../models/repositories/cart");
const { checkProductByServer } = require("../models/repositories/product");
const { getDiscountAmount } = require("./discount.service");
const RedisService = require("./redis.service");
const orderModel = require("../models/order.model");
const { convertToObjectId } = require("../utils");
const { findUserById } = require("../models/repositories/user");
const { calculateRevenueByDay, calculateRevenueByMonth, calculateRevenueByWeek, calculateRevenueByQuarter, calculateRevenueByYear } = require("../models/repositories/order");

/*
{
    userId,
    cardId,
    orders: [
        {
            discounts: [{
                discountId,
                code,
            }],
            products: [{
                price,
                quantity,
                productId
            }],
        }
    ],
}
 */
class CheckoutService {
    static checkoutReview = async ({userId, orders}) => {
        const checkoutOrder = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            finalPrice: 0,
        }, checkout_items = [];

        for (let i = 0; i < orders.length; i++) {
            const {discounts = [], products = []} = orders[i];
            const checkProduct = await checkProductByServer(products);
            if (!checkProduct[0]) throw new BadRequestError('Order wrong!!!');
            
            const checkoutPrice = checkProduct.reduce((acc, product) => {
                return acc + (product.product_price * product.product_quantity);
            }, 0)
            checkoutOrder.totalPrice += checkoutPrice;
            
            const itemCheckout = {
                discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProduct,
            }
            for (let i = 0; i < discounts.length; i++) {
                const {discount = 0} = await getDiscountAmount({
                    discountId: discounts[i].discountId,
                    userId,
                    products: checkProduct,
                })
                
                checkoutOrder.totalDiscount += discount;
                if (discount > 0) itemCheckout.priceApplyDiscount -= discount;
            }
            checkoutOrder.finalPrice += itemCheckout.priceApplyDiscount;
            checkout_items.push(itemCheckout);
        }
        // console.log(">>>Return: ", {
        //     orders,
        //     checkout_items,
        //     checkoutOrder
        // })
        return {
            orders,
            checkout_items,
            checkoutOrder
        }
    }

    static orderByUser = async ({
        orders,
        userId,
        order_address = {},
        order_payment = {},
        order_note = '',
    }) => {
        const foundCart = await getUserCart(userId);
        if (!foundCart) throw new NotFoundError('Not found cart');
        const foundUser = await findUserById(userId);
        if (!foundUser) throw new NotFoundError('Not found user');
        const {checkout_items, checkoutOrder} = await this.checkoutReview({userId, orders});
        if (checkout_items == []) throw new BadRequestError('Order wrong because no products!!!');

        const products = checkout_items.flatMap(item => item.item_products);
        // console.log(">>>products: ", products);
        const acquireProducts = [];
        for (let i = 0; i < products.length; i++) {
            const {productId, product_quantity} = products[i];
            const keyLock = await RedisService.acquireLock(productId, product_quantity, foundCart._id);
            acquireProducts.push(keyLock ? true : false);
            if (keyLock) {
                await RedisService.releaseLock(keyLock);
            }
        }

        if (acquireProducts.includes(false)) throw new BadRequestError('Something wrong with products!!!');
        
        const newOrder = await orderModel.create({
            order_userId: convertToObjectId(userId),
            order_note,
            order_address,
            order_payment,
            order_phone: foundUser.phone,
            order_checkout: checkoutOrder,
            order_products: checkout_items
        })

        for (let i = 0; i < products.length; i++) {
            const {productId, product_quantity} = products[i];
            const productInCart = await findProductInCartv2(userId, productId);
            if (productInCart) {
                await deleteProductInCart({userId, product: {productId, product_quantity}});
            }
        }

        return newOrder;
    }

    static calculateRevenue = async (type) => {
        switch (type) {
            case 'day':
                return await calculateRevenueByDay();
                break;
            case 'week':
                return await calculateRevenueByWeek();
                break;
            case 'month':
                return await calculateRevenueByMonth();
                break;
            case 'quarter':
                return await calculateRevenueByQuarter();
                break;
            case 'year':
                return await calculateRevenueByYear();
        }
    }
}

module.exports = CheckoutService;