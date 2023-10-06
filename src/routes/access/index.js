'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const AccessController = require('../../controllers/access.controller');
const router = express.Router();

router.post('/user/signingUp', asyncHandler(AccessController.signUp));

module.exports = router;