'use strict';

const { Types } = require("mongoose");
const { NotFoundError, BadRequestError } = require("../core/error-response");
const { getUserCart } = require("../models/repositories/cart");
const { checkProductByServer } = require("../models/repositories/product");
const { getDiscountAmount } = require("./discount.service");

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
        const foundCart = await getUserCart(userId);
        if (!foundCart) throw new NotFoundError('Not found cart');
        // console.log(">>>Orders: ", orders)
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
}

module.exports = CheckoutService;