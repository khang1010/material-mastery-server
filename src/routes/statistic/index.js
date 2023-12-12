'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, permission } = require('../../auth/checkAuth');
const CheckoutController = require('../../controllers/checkout.controller');
const BillController = require('../../controllers/bill.controller');

const router = express.Router();

router.use(authentication)
router.use(permission('staff'))
router.get('/order', asyncHandler(CheckoutController.calculateRevenue));
router.get('/', asyncHandler(BillController.calculateRevenue));

module.exports = router;