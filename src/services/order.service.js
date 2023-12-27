'use strict';
const moment = require('moment-timezone');
const { BadRequestError } = require("../core/error-response");
const { updateInventoryStock, pullReservationInventory } = require("../models/repositories/inventory");
const { getOrdersByUser, updateOrderById, calculateOrdersByTimeRange, getNumberOfOrdersByCustomer } = require("../models/repositories/order");
const { convertToObjectId } = require("../utils");
const ProductService = require("./product.service");
const { findUserById } = require('../models/repositories/user');

class OrderService {
    static getOrdersByCustomer = async (payload) => {
        const order = await getOrdersByUser({...payload, filter: {
            order_userId: convertToObjectId(payload.userId)
        }, unSelect: ["order_userId", "__v"]});
        // console.log(">>>order: ", order);
        if (!order) throw new BadRequestError("Get orders failed");
        const user = await findUserById(payload.userId);
        if (!user) throw new BadRequestError("Get orders failed");
        return {
            orders: order,
            order_username: user.display_name
        };
    }
    static getOrdersByStaff = async (payload) => {
        const {status} = payload;
        // console.log(">>>status: ", status);
        let order = [];
        if (!status) {
            order = await getOrdersByUser({...payload, unSelect: ["__v"]});
        } else {
            order = await getOrdersByUser({...payload, unSelect: ["__v"], filter: {
                order_status: status
            }});
        }
        if (!order) throw new BadRequestError("Get orders failed");
        for (let i = 0; i < order.length; i++) {
            const user = await findUserById(order[i].order_userId.toString());
            if (!user) throw new BadRequestError("Get orders failed");  
            order[i].order_username = user.display_name; 
        }
        return order;
    }
    static getOrdersByPaymentStatus = async (payload) => {
        const {status} = payload;
        let order = [];
        if (!status) {
            order = await getOrdersByUser({...payload, unSelect: ["__v"]});
        } else {
            order = await getOrdersByUser({...payload, unSelect: ["__v"], filter: {
                'order_payment.status': status
            }});
        }
        if (!order) throw new BadRequestError("Get orders failed");
        for (let i = 0; i < order.length; i++) {
            const user = await findUserById(order[i].order_userId.toString());
            if (!user) throw new BadRequestError("Get orders failed");  
            order[i].order_username = user.display_name; 
        }
        return order;
    }
    static getOrderById = async (id) => {
        const foundOrder = await getOrdersByUser({filter: {
            _id: convertToObjectId(id)
        }, unSelect: ["__v"]});
        const user = await findUserById(foundOrder[0].order_userId.toString());
        return {
            ...foundOrder[0],
            order_username: user.display_name
        };
    }
    static updateOrderStatusById = async (payload) => {
        const {orderId, status} = payload;
        if (status == 'shipping') {
            const {exportId = ""} = payload;
            if (!exportId) throw new BadRequestError("Missing exportId");
            const order = await updateOrderById(orderId, {order_status: status, order_exportId: exportId});
            if (!order) throw new BadRequestError("Update order status failed");
            return order;
        }
        const order = await updateOrderById(orderId, {order_status: status});
        if (!order) throw new BadRequestError("Update order status failed");
        if (status == 'cancelled') {
            const {order_products = []} = order;
            for (let i = 0; i < order_products.length; i++) {
                const {item_products} = order_products[i];
                const {productId, product_quantity} = item_products[0];
                const updateInventory = await pullReservationInventory(productId, parseInt(product_quantity));
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
            const updateInventory = await pullReservationInventory(productId, parseInt(product_quantity));
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
    static getNumberOfOrdersByCustomer = async (userId) => {
        return {
            pending: await getNumberOfOrdersByCustomer(userId, 'pending'),
            confirmed: await getNumberOfOrdersByCustomer(userId, 'confirmed'),
            cancelled: await getNumberOfOrdersByCustomer(userId, 'cancelled'),
            shipping: await getNumberOfOrdersByCustomer(userId, 'shipping'),
            shipped: await getNumberOfOrdersByCustomer(userId, 'shipped'),
            delivered: await getNumberOfOrdersByCustomer(userId, 'delivered'),
            failed: await getNumberOfOrdersByCustomer(userId, 'failed'),
        }
    }
    static getOrdersByTimeRange = async (payload) => {
        const {start, end, status} = payload;
        const startMoment = moment(start, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').startOf('day');
        const endMoment = moment(end, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').endOf('day');
        if (!status) {
            return await getOrdersByUser({filter: {
                order_date: {
                    $gte: startMoment.toDate(),
                    $lt: endMoment.toDate(),
                },
            }});
        }
        return await getOrdersByUser({filter: {
            order_date: {
                $gte: startMoment.toDate(),
                $lt: endMoment.toDate(),
            },
            order_status: status,
        }});
    }
    static confirmDeliveredByCustomer = async (payload) => {
        const {orderId} = payload;
        const foundOrder = await getOrdersByUser({filter: {
            _id: convertToObjectId(orderId)
        }});
        if (!foundOrder[0]) throw new BadRequestError("Order not found");
        if (foundOrder[0].order_status == 'delivered') throw new BadRequestError("Order already confirm delivered");
        if (foundOrder[0].order_status != 'shipped') throw new BadRequestError("You can't confirm it");
        const order = await updateOrderById(orderId, {order_status: 'delivered'});
        return order;
    }
}

module.exports = OrderService;