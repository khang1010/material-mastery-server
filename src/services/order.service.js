'use strict';
const moment = require('moment-timezone');
const { BadRequestError } = require("../core/error-response");
const { updateInventoryStock } = require("../models/repositories/inventory");
const { getOrdersByUser, updateOrderById, calculateOrdersByTimeRange } = require("../models/repositories/order");
const { convertToObjectId } = require("../utils");
const ProductService = require("./product.service");

class OrderService {
    static getOrdersByCustomer = async (payload) => {
        return await getOrdersByUser({...payload, filter: {
            order_userId: convertToObjectId(payload.userId)
        }, unSelect: ["order_userId", "__v"]});
    }
    static getOrdersByStaff = async (payload) => {
        const {status} = payload;
        console.log(">>>status: ", status);
        if (!status) return await getOrdersByUser({...payload, unSelect: ["__v"]});
        return await getOrdersByUser({...payload, unSelect: ["__v"], filter: {
            order_status: status
        }});
    }
    static getOrderById = async (id) => {
        const foundOrder = await getOrdersByUser({filter: {
            _id: convertToObjectId(id)
        }, unSelect: ["__v"]});
        return foundOrder[0];
    }
    static updateOrderStatusById = async (payload) => {
        const {orderId, status} = payload;
        const order = await updateOrderById(orderId, {order_status: status});
        if (!order) throw new BadRequestError("Update order status failed");
        if (status == 'cancelled') {
            const {order_products = []} = order;
            for (let i = 0; i < order_products.length; i++) {
                const {item_products} = order_products[i];
                const {productId, product_quantity} = item_products[0];
                const updateInventory = await updateInventoryStock(productId, parseInt(product_quantity));
                if (!updateInventory) throw new BadRequestError('Update inventory failed!!!');
                const updateProduct = await ProductService.updateProductById(productId, {product_quantity: updateInventory.inventory_stock});
                if (!updateProduct) throw new BadRequestError('Update product failed!!!');
            }
        }
        return order;
    }
    static cancelOrderByUser = async (payload) => {
        const {orderId} = payload;
        const foundOrder = await getOrdersByUser({filter: {
            _id: convertToObjectId(orderId)
        }});
        if (!foundOrder[0]) throw new BadRequestError("Order not found");
        if (foundOrder[0].order_status == 'cancelled') throw new BadRequestError("Order already cancelled");
        if (foundOrder[0].order_status != 'pending') throw new BadRequestError("You can't cancel it");
        const order = await updateOrderById(orderId, {order_status: 'cancelled'});
        if (!order) throw new BadRequestError("Cancel Product failed");
        const {order_products = []} = order;
        for (let i = 0; i < order_products.length; i++) {
            const {item_products} = order_products[i];
            const {productId, product_quantity} = item_products[0];
            const updateInventory = await updateInventoryStock(productId, parseInt(product_quantity));
            if (!updateInventory) throw new BadRequestError('Update inventory failed!!!');
            const updateProduct = await ProductService.updateProductById(productId, {product_quantity: updateInventory.inventory_stock});
            if (!updateProduct) throw new BadRequestError('Update product failed!!!');
        }
        return order;
    }
    static getNumberOfOrderByTimeRange = async (payload) => {
        const {start, end} = payload;
        const startMoment = moment(start, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').startOf('day');
        const endMoment = moment(end, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').endOf('day');
        return {
            pending: await calculateOrdersByTimeRange(startMoment, endMoment, 'pending'),
            confirmed: await calculateOrdersByTimeRange(startMoment, endMoment, 'confirmed'),
            cancelled: await calculateOrdersByTimeRange(startMoment, endMoment, 'cancelled'),
            shipping: await calculateOrdersByTimeRange(startMoment, endMoment, 'shipping'),
            shipped: await calculateOrdersByTimeRange(startMoment, endMoment, 'shipped'),
            delivered: await calculateOrdersByTimeRange(startMoment, endMoment, 'delivered'),
            failed: await calculateOrdersByTimeRange(startMoment, endMoment, 'failed'),
        }
    }
}

module.exports = OrderService;