'use strict';
const express = require('express');
const { checkApiKeyV0 } = require('../auth/checkAuth');
const router = express.Router();

router.use(checkApiKeyV0)

router.use('/v1/api', require('./access/index'));
router.use('/v1/api/key', require('./apiKey/index'));

module.exports = router;