'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const DeliveryController = require('../../controllers/delivery.controller');
const { authentication, permission } = require('../../auth/checkAuth');
const router = express.Router();

router.use(authentication);
router.use(permission('staff'));
router.get(
  '/user/:userId',
  asyncHandler(DeliveryController.getDeliveriesByUserId)
);
router.get(
  '/shipping',
  asyncHandler(DeliveryController.getAllNotShippingOrders)
);
router.get('/:id', asyncHandler(DeliveryController.getDeliveriesById));
router.get('/', asyncHandler(DeliveryController.getAll));
router.post('/', asyncHandler(DeliveryController.create));
router.delete('/:id', asyncHandler(DeliveryController.deleteDeliveryById));
router.patch(
  '/status/:id',
  asyncHandler(DeliveryController.updateStatusDeliveryById)
);
router.patch('/:id', asyncHandler(DeliveryController.updateDeliveryById));

module.exports = router;
