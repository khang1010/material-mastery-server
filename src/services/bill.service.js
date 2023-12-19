'use strict';
const moment = require('moment-timezone');
const { BadRequestError } = require("../core/error-response");
const { createBill, deleteBillById, restoreBillById, getBillsByUser, getProductsInBill, createExportBill, calculateRevenueByTimeRange, calculateNumberOfBillByType } = require("../models/repositories/bill");
const { updateInventoryStock } = require("../models/repositories/inventory");
const { checkProductByServer } = require("../models/repositories/product");
const { convertToObjectId } = require("../utils");
const { getDiscountAmount } = require("./discount.service");
const ProductService = require("./product.service");

class BillService {
    static checkoutReview = async (orders) => {
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
            for (let j = 0; j < checkProduct.length; j++) {
                checkProduct[j].product_price = products[j].price;
            }
            
            const checkoutPrice = products.reduce((acc, product) => {
                return acc + (product.price * product.quantity);
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
                    products: checkProduct,
                })
                
                checkoutOrder.totalDiscount += discount;
                if (discount > 0) itemCheckout.priceApplyDiscount -= discount;
            }
            checkoutOrder.finalPrice += itemCheckout.priceApplyDiscount;
            checkout_items.push(itemCheckout);
        }
        
        return {
            orders,
            checkout_items,
            checkoutOrder
        }
    }
    static createImportBill = async (payload) => {
        const {checkout_items, checkoutOrder} = await this.checkoutReview(payload.products);
        const products = checkout_items.flatMap(item => item.item_products);
        const newBill = await createBill({...payload, bill_type: 'import', bill_checkout: checkoutOrder, product_list: checkout_items});
        if (!newBill) throw new BadRequestError('Create bill failed!!!');
        for (let i = 0; i < products.length; i++) {
            const {productId, product_quantity} = products[i];
            const updateInventory = await updateInventoryStock(productId, product_quantity);
            if (!updateInventory) throw new BadRequestError('Update inventory failed!!!');
            const updateProduct = await ProductService.updateProductById(productId, {product_quantity: updateInventory.inventory_stock});
            if (!updateProduct) throw new BadRequestError('Update product failed!!!');
        }
        return newBill;
    }
    static createExportBill = async (payload) => {
        const {checkout_items, checkoutOrder} = await this.checkoutReview(payload.products);
        const products = checkout_items.flatMap(item => item.item_products);
        const newBill = await createExportBill({...payload, bill_checkout: checkoutOrder, product_list: checkout_items});
        if (!newBill) throw new BadRequestError('Create bill failed!!!');
        for (let i = 0; i < products.length; i++) {
            const {productId, product_quantity} = products[i];
            const updateInventory = await updateInventoryStock(productId, parseInt(product_quantity) * -1);
            if (!updateInventory) throw new BadRequestError('Update inventory failed!!!');
            const updateProduct = await ProductService.updateProductById(productId, {product_quantity: updateInventory.inventory_stock});
            if (!updateProduct) throw new BadRequestError('Update product failed!!!');
        }
        return newBill;
    }
    static deleteBillById = async (billId) => {
        const deletedBill = await deleteBillById(billId);
        if (!deletedBill) throw new BadRequestError('Delete bill failed!!!');
        
        return deletedBill;
    }
    static restoreBill = async (billId) => {
        const restoredBill = await restoreBillById(billId);
        if (!restoredBill) throw new BadRequestError('Restore bill failed!!!');
        
        return restoredBill;
    }
    static getAllImportBill = async (payload) => {
        const foundBill = await getBillsByUser({...payload, filter: {
            bill_type: 'import',
            bill_status: 'pending',
        }, select: ['bill_date', 'bill_note', 'bill_checkout', 'bill_payment', 'bill_address', 'bill_image', 'supplier', 'product_list', 'tax', '_id']});
        const bills = [];
        for (let i = 0; i < foundBill.length; i++) {
            bills.push({
                bill_info: {...foundBill[i], product_list: undefined},
                products_info: await getProductsInBill(foundBill[i].product_list),
            })
        }
        return bills;
    }
    static getAllExportBill = async (payload) => {
        const foundBill = await getBillsByUser({...payload, filter: {
            bill_type: 'export',
            bill_status: 'pending',
        }, select: ['bill_date', 'bill_note', 'bill_checkout', 'bill_payment', 'bill_address', 'supplier', 'product_list', '_id']});
        const bills = [];
        for (let i = 0; i < foundBill.length; i++) {
            bills.push({
                bill_info: {...foundBill[i], product_list: undefined, customer: foundBill[i].supplier, supplier: undefined},
                products_info: await getProductsInBill(foundBill[i].product_list),
            })
        }
        return bills;
    }
    static getImportBillById = async (billId) => {
        const foundBill = await getBillsByUser({filter: {
            _id: convertToObjectId(billId),
            bill_type: 'import',
        }, select: ['bill_date', 'bill_note', 'bill_checkout', 'bill_payment', 'bill_address', 'bill_image', 'supplier', 'product_list', 'tax']});
        return {
            bill_info: {...foundBill[0], product_list: undefined},
            products_info: await getProductsInBill(foundBill[0].product_list),
        }
    }
    static getExportBillById = async (billId) => {
        const foundBill = await getBillsByUser({filter: {
            _id: convertToObjectId(billId),
            bill_type: 'export',
        }, select: ['bill_date', 'bill_note', 'bill_checkout', 'bill_payment', 'bill_address', 'supplier', 'product_list']});
        return {
            bill_info: {...foundBill[0], product_list: undefined, customer: foundBill[0].supplier, supplier: undefined},
            products_info: await getProductsInBill(foundBill[0].product_list),
        }
    }
    static calculateRevenueByTimeRange = async (payload) => {
        const {start, end} = payload;
        const startMoment = moment(start, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').startOf('day');
        const endMoment = moment(end, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').endOf('day');
        return await calculateRevenueByTimeRange(startMoment, endMoment);
    }
    static getNumberOfBill = async () => {
        return {
            import: await calculateNumberOfBillByType('import'),
            export: await calculateNumberOfBillByType('export'),
        }
    }
}

module.exports = BillService