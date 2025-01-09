'use strict';

const { OkResponse } = require('../core/success-response');
const OrderService = require('../services/order.service');

class OrderController {
  static getOrdersByCustomer = async (req, res, next) => {
    new OkResponse({
      message: 'Get orders successfully',
      metadata: await OrderService.getOrdersByCustomer({
        userId: req.user.userId,
        ...req.query,
      }),
    }).send(res);
  };
  static getOrdersByStaff = async (req, res, next) => {
    new OkResponse({
      message: 'Get orders successfully',
      metadata: await OrderService.getOrdersByStaff(req.query),
    }).send(res);
  };
  static getOrdersByPaymentStatus = async (req, res, next) => {
    new OkResponse({
      message: 'Get orders successfully',
      metadata: await OrderService.getOrdersByPaymentStatus(req.query),
    }).send(res);
  };
  static getOrderById = async (req, res, next) => {
    new OkResponse({
      message: 'Get order successfully',
      metadata: await OrderService.getOrderById(req.params.id),
    }).send(res);
  };
  static updateOrderStatusById = async (req, res, next) => {
    new OkResponse({
      message: 'Update order status successfully',
      metadata: await OrderService.updateOrderStatusById({
        orderId: req.params.id,
        status: req.query.status,
        exportId: req.query.exportId,
      }),
    }).send(res);
  };
  static getNumberOfOrderByTimeRange = async (req, res, next) => {
    new OkResponse({
      message: 'Get number of orders by time range successfully',
      metadata: await OrderService.getNumberOfOrderByTimeRange(req.query),
    }).send(res);
  };
  static getNearbyOrdersByIds = async (req, res, next) => {
    new OkResponse({
      message: 'Get nearby orders by ids successfully',
      metadata: await OrderService.getNearbyOrdersByIds(
        req.query.orderIds,
        req.query.radius,
        { page: req.query.page, limit: req.query.limit }
      ),
    }).send(res);
  };
  static getNearbyOrdersById = async (req, res, next) => {
    new OkResponse({
      message: 'Get nearby orders by id successfully',
      metadata: await OrderService.getNearbyOrdersByIds(
        req.params.orderId,
        req.query.radius,
        { page: req.query.page, limit: req.query.limit }
      ),
    }).send(res);
  };
  static cancelProductByCustomer = async (req, res, next) => {
    new OkResponse({
      message: 'Cancel product successfully',
      metadata: await OrderService.cancelOrderByUser({
        orderId: req.params.id,
      }),
    }).send(res);
  };
  static getNumberOfOrdersByCustomer = async (req, res, next) => {
    new OkResponse({
      message: 'Get number of orders successfully',
      metadata: await OrderService.getNumberOfOrdersByCustomer(req.user.userId),
    }).send(res);
  };
  static getOrdersByTimeRange = async (req, res, next) => {
    new OkResponse({
      message: 'Get orders successfully',
      metadata: await OrderService.getOrdersByTimeRange(req.query),
    }).send(res);
  };
  static confirmDeliveredByCustomer = async (req, res, next) => {
    new OkResponse({
      message: 'Confirm delivered successfully',
      metadata: await OrderService.confirmDeliveredByCustomer({
        orderId: req.params.id,
      }),
    }).send(res);
  };
  static updateOrderPaymentStatus = async (req, res, next) => {
    new OkResponse({
      message: 'Update order payment status successfully',
      metadata: await OrderService.updateOrderPaymentStatus({
        id: req.params.id,
        status: req.query.status,
      }),
    }).send(res);
  };
  static getRouteForListOrders = async (req, res, next) => {
    new OkResponse({
      message: 'Get route for list orders successfully',
      metadata: await OrderService.getRouteForListOrders(req.body),
    }).send(res);
  };
}

module.exports = OrderController;
