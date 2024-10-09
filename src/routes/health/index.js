const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const HealthController = require('../../controllers/health.controller');

const router = express.Router();

router.get('/', asyncHandler(HealthController.checkHealth));

module.exports = router;
