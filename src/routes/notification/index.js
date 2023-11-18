'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/checkAuth');
const NotificationController = require('../../controllers/notification.controller');
const router = express.Router();

router.use(authentication);
router.get('/:type', asyncHandler(NotificationController.getByType));

module.exports = router;