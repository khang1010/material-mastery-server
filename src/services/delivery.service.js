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
const {
  getOrdersByIds,
  getOrdersByUser,
} = require('../models/repositories/order');
const OrderService = require('./order.service');
const { findUserById } = require('./user.service');

class DeliveryService {
  static create = async (payload) => {
    const { orderIds, userId, startLocation } = payload;
    const routes = await OrderService.getRouteForListOrders({
      orderIds,
      startLocation,
    });
    const foundUser = await findUserById(userId);
    if (!foundUser) throw new BadRequestError('User not found');
    return await createDelivery({ ...payload, routes });
  };

  static getAllDeliveries = async () => {
    const deliveries = await getAllDeliveries();
    const orderIds = deliveries.map((delivery) => delivery.orderIds).flat();
    const orders = await getOrdersByIds(orderIds);
    const result = deliveries.map((delivery) => {
      const ordersResult = orders.filter((order) =>
        delivery.orderIds.includes(order._id)
      );
      return {
        ...delivery,
        orderInfos: ordersResult,
      };
    });
    return result;
  };

  static getDeliveriesByUserId = async (userId) => {
    const deliveries = await findByUserId(userId);
    const orderIds = deliveries.map((delivery) => delivery.orderIds).flat();
    const orders = await getOrdersByIds(orderIds);
    const result = deliveries.map((delivery) => {
      const ordersResult = orders.filter((order) =>
        delivery.orderIds.includes(order._id)
      );
      return {
        ...delivery,
        orderInfos: ordersResult,
      };
    });
    return result;
  };

  static getDeliveriesById = async (id) => {
    const deliveries = await findDeliveryById(id);
    if (!deliveries) throw new BadRequestError('Delivery not found');

    const orderIds = deliveries.orderIds;
    const orders = await getOrdersByIds(orderIds);

    return {
      deliveries,
      orderInfos: orders,
    };
  };

  static getAllNotShippingOrders = async () => {
    const deliveries = await getAllDeliveries();
    const orderIds = deliveries.map((delivery) => delivery.orderIds).flat();
    if (!orderIds || orderIds.length === 0) return [];

    const orders = await getOrdersByUser({
      filter: { order_status: 'shipping' },
    });
    const resultOrderIds = orders.filter(
      (order) => !orderIds.includes(order._id)
    );
    return resultOrderIds;
  };

  static deleteDeliveryById = async (id) => {
    return await deleteDeliveryById(id);
  };

  static updateDeliveryById = async (id, data) => {
    const { orderIds } = data;
    let updatedData = data;
    if (orderIds && orderIds.length > 0) {
      const routes = await OrderService.getRouteForListOrders({
        orderIds,
        startLocation,
      });
      updatedData = { ...data, routes };
    }
    return await updateDeliveryById(id, removeUndefinedObject(updatedData));
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
    return await updateDeliveryById(id, { status });
  };

  static assignNearbyOrdersToDelivery = async (
    deliveryId,
    orderIds,
    radius
  ) => {
    const delivery = await findDeliveryById(deliveryId);
    if (!delivery) throw new BadRequestError('Delivery not found');

    orderIds.forEach((orderId) => {
      if (!delivery.orderIds.includes(orderId))
        throw new BadRequestError('Order not assigned to delivery');
    });

    const nearbyOrders = await OrderService.getNearbyOrdersByIds(
      orderIds,
      radius
    );
    const nearbyOrderIds = nearbyOrders
      .map((nearbyOrder) => {
        return nearbyOrder.nearbyOrderIds;
      })
      .flat();

    const updatedOrderIds = [
      ...delivery.orderIds,
      ...Array.from(new Set(nearbyOrderIds)),
    ];
    if (updatedOrderIds.length === delivery.orderIds.length) {
      return delivery;
    }
    return await updateDeliveryById(deliveryId, { orderIds: updatedOrderIds });
  };
}

module.exports = DeliveryService;
