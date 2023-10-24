'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const AccessController = require('../../controllers/access.controller');
const { authentication } = require('../../auth/checkAuth');
const router = express.Router();

router.post('/signUp', asyncHandler(AccessController.signUp));
router.post('/signIn', asyncHandler(AccessController.signIn));

router.use(authentication);
router.post('/signOut', asyncHandler(AccessController.signOut));

module.exports = router;