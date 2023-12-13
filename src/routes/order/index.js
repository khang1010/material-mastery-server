'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, permission } = require('../../auth/checkAuth');
const OrderController = require('../../controllers/order.controller');

const router = express.Router();

router.use(authentication)
router.get('/', asyncHandler(OrderController.getOrdersByCustomer));
router.get('/find/:id', asyncHandler(OrderController.getOrderById));
router.use(permission('staff'))
router.get('/staff', asyncHandler(OrderController.getOrdersByStaff));
router.patch('/status/:id', asyncHandler(OrderController.updateOrderStatusById));
router.get('/number', asyncHandler(OrderController.getNumberOfOrderByTimeRange));

module.exports = router;