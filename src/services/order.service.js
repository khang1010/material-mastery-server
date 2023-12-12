'use strict';

const { getOrdersByUser, updateOrderById } = require("../models/repositories/order");
const { convertToObjectId } = require("../utils");

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
        return await updateOrderById(orderId, {order_status: status});
    }
}

module.exports = OrderService;