'use strict';
const express = require('express');
const { checkApiKeyV0 } = require('../auth/checkAuth');
const router = express.Router();

router.use(checkApiKeyV0);

router.use('/v1/api/auth', require('./auth/index'));
router.use('/v1/api/product', require('./product/index'));
router.use('/v1/api/category', require('./category/index'));
router.use('/v1/api/key', require('./apiKey/index'));
router.use('/v1/api/user', require('./user/index'));
router.use('/v1/api/cart', require('./cart/index'));
router.use('/v1/api/comment', require('./comment/index'));
router.use('/v1/api/notification', require('./notification/index'));
router.use('/v1/api/favorite', require('./favorite/index'));
router.use('/v1/api/discount', require('./discount/index'));
router.use('/v1/api/checkout', require('./checkout/index'));
router.use('/v1/api/statistic', require('./statistic/index'));
router.use('/v1/api/bill', require('./bill/index'));
router.use('/v1/api/order', require('./order/index'));
router.use('/v1/api', require('./access/index'));

module.exports = router;
