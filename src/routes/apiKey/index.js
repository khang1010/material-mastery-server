'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const ApiKeyController = require('../../controllers/apiKey.controller');
const { checkApiKeyV2 } = require('../../auth/checkAuth');
const router = express.Router();

router.use(checkApiKeyV2);
router.get('/:permission', asyncHandler(ApiKeyController.getApiKey));

module.exports = router;