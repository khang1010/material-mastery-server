'use strict';
const express = require('express');
const { authentication } = require('../../auth/checkAuth');
const UserController = require('../../controllers/user.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const router = express.Router();

router.use(authentication);
router.patch('/:user_id', asyncHandler(UserController.updateUser));

module.exports = router;