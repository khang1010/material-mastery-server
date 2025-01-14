'use strict';
const { CreatedResponse, OkResponse } = require('../core/success-response');
const DeliveryService = require('../services/delivery.service');

class DeliveryController {
  static create = async (req, res, next) => {
    new CreatedResponse({
      message: 'Create Delivery successfully',
      metadata: await DeliveryService.create({
        ...req.body,
        userId: req.user.userId,
      }),
    }).send(res);
  };
  static getAll = async (req, res, next) => {
    new OkResponse({
      message: 'Get all deliveries successfully',
      metadata: await DeliveryService.getAllDeliveries({ ...req.query }),
    }).send(res);
  };
  static getAllNotShippingOrders = async (req, res, next) => {
    new OkResponse({
      message: 'Get all deliveries not shipping successfully',
      metadata: await DeliveryService.getAllNotShippingOrders(),
    }).send(res);
  };
  static getDeliveriesByUserId = async (req, res, next) => {
    new OkResponse({
      message: 'Get deliveries by user id successfully',
      metadata: await DeliveryService.getDeliveriesByUserId(req.params.userId),
    }).send(res);
  };
  static getDeliveriesById = async (req, res, next) => {
    new OkResponse({
      message: 'Get deliveries by id successfully',
      metadata: await DeliveryService.getDeliveriesById(req.params.id),
    }).send(res);
  };
  static deleteDeliveryById = async (req, res, next) => {
    new OkResponse({
      message: 'Delete delivery successfully',
      metadata: await DeliveryService.deleteDeliveryById(req.params.id),
    }).send(res);
  };
  static updateDeliveryById = async (req, res, next) => {
    new OkResponse({
      message: 'Update delivery successfully',
      metadata: await DeliveryService.updateDeliveryById(
        req.params.id,
        req.body
      ),
    }).send(res);
  };
  static updateStatusDeliveryById = async (req, res, next) => {
    new OkResponse({
      message: 'Update delivery status successfully',
      metadata: await DeliveryService.updateStatusDeliveryById(
        req.params.id,
        req.query.status
      ),
    }).send(res);
  };
  static assignNearbyOrdersToDelivery = async (req, res, next) => {
    new OkResponse({
      message: 'Assign nearby orders to delivery successfully',
      metadata: await DeliveryService.assignNearbyOrdersToDelivery(
        req.params.id,
        req.body.orderIds,
        req.body.radius
      ),
    }).send(res);
  };
}

module.exports = DeliveryController;
