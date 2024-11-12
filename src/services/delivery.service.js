'use strict';

const { BadRequestError } = require('../core/error-response');
const { findById } = require('../models/delivery.model');
const {
  createDelivery,
  getAllDeliveries,
  deleteDeliveryById,
  updateDeliveryById,
  findByUserId,
  findDeliveryById,
  getAllDeliveriesByFilter,
} = require('../models/repositories/delivery');
const { getOrdersByIds } = require('../models/repositories/order');
const OrderService = require('./order.service');
const { findUserById } = require('./user.service');

class DeliveryService {
  static create = async (payload) => {
    const { orderIds, userId } = payload;
    const routes = await OrderService.getRouteForListOrders({ orderIds });
    const foundUser = await findUserById(userId);
    return await createDelivery({ ...payload, routes });
  };

  static getAllDeliveries = async () => {
    return await getAllDeliveries();
  };

  static getDeliveriesByUserId = async (userId) => {
    return await findByUserId(userId);
  };

  static deleteDeliveryById = async (id) => {
    return await deleteDeliveryById(id);
  };

  static updateDeliveryById = async (id, data) => {
    return await updateDeliveryById(id, removeUndefinedObject(data));
  };

  static updateStatusDeliveryById = async (id, status) => {
    const foundDelivery = await findDeliveryById(id);
    if (!foundDelivery) throw new NotFoundError('Delivery not found');
    if (status === 'completed') {
      const orders = await getOrdersByIds(foundDelivery.orderIds, 'shipping');
      for (const order of orders) {
        await OrderService.updateOrderStatusById({
          orderId: order._id,
          status: 'shipped',
        });
      }
    }
    // if (status === 'pending') {
    //   const pendingDelivery = await getAllDeliveriesByFilter({
    //     filter: {
    //       status,
    //       userId: foundDelivery.userId,
    //     },
    //     limit: 1,
    //   });
    //   if (pendingDelivery.length > 0)
    //     throw new BadRequestError('Have another delivery is pending');
    // }
    return await updateDeliveryById(id, status);
  };
}

module.exports = DeliveryService;
