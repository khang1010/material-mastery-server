'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, permission } = require('../../auth/checkAuth');
const OrderController = require('../../controllers/order.controller');

const router = express.Router();

router.use(authentication)
router.get('/customer/number', asyncHandler(OrderController.getNumberOfOrdersByCustomer));
router.get('/find/:id', asyncHandler(OrderController.getOrderById));
router.patch('/cancel/:id', asyncHandler(OrderController.cancelProductByCustomer));
router.patch('/confirm/:id', asyncHandler(OrderController.confirmDeliveredByCustomer));
router.get('/', asyncHandler(OrderController.getOrdersByCustomer));
router.use(permission('staff'))
router.get('/staff/time', asyncHandler(OrderController.getOrdersByTimeRange));
router.get('/payment/status', asyncHandler(OrderController.getOrdersByPaymentStatus));
router.get('/staff', asyncHandler(OrderController.getOrdersByStaff));
router.patch('/status/:id', asyncHandler(OrderController.updateOrderStatusById));
router.get('/number', asyncHandler(OrderController.getNumberOfOrderByTimeRange));

module.exports = router;