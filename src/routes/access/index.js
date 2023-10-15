'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const AccessController = require('../../controllers/access.controller');
const router = express.Router();

router.post('/user/signUp', asyncHandler(AccessController.signUp));
router.post('/user/signIn', asyncHandler(AccessController.signIn));


router.post('/user/signOut', asyncHandler(AccessController.signOut));

module.exports = router;