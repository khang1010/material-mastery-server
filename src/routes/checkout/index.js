const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, permission } = require('../../auth/checkAuth');
const CheckoutController = require('../../controllers/checkout.controller');

const router = express.Router();

router.use(authentication)
router.post('/review', asyncHandler(CheckoutController.checkoutReview));
router.post('/order', asyncHandler(CheckoutController.orderByUser));

module.exports = router;