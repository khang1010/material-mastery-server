'use strict';

const { OkResponse } = require("../core/success-response");
const OrderService = require("../services/order.service");

class OrderController {
    static getOrdersByCustomer = async (req, res, next) => {
        new OkResponse({
            message: "Get orders successfully",
            metadata: await OrderService.getOrdersByCustomer({userId: req.user.userId, ...req.query})
        }).send(res);
    }
    static getOrdersByStaff = async (req, res, next) => {
        new OkResponse({
            message: "Get orders successfully",
            metadata: await OrderService.getOrdersByStaff(req.query)
        }).send(res);
    }
    static getOrderById = async (req, res, next) => {
        new OkResponse({
            message: "Get order successfully",
            metadata: await OrderService.getOrderById(req.params.id)
        }).send(res);
    }
    static updateOrderStatusById = async (req, res, next) => {
        new OkResponse({
            message: "Update order status successfully",
            metadata: await OrderService.updateOrderStatusById({orderId: req.params.id, status: req.query.status})
        }).send(res);
    }
    static getNumberOfOrderByTimeRange = async (req, res, next) => {
        new OkResponse({
            message: "Get number of orders by time range successfully",
            metadata: await OrderService.getNumberOfOrderByTimeRange(req.query)
        }).send(res);
    }
    static cancelProductByCustomer = async (req, res, next) => {
        new OkResponse({
            message: "Cancel product successfully",
            metadata: await OrderService.cancelOrderByUser({orderId: req.params.id})
        }).send(res);
    }
}

module.exports = OrderController;