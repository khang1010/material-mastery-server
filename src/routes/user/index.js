'use strict';
const express = require('express');
const { authentication, permission } = require('../../auth/checkAuth');
const UserController = require('../../controllers/user.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const router = express.Router();

router.use(authentication);
router.get('/', asyncHandler(UserController.getUserById));
router.patch('/:user_id', asyncHandler(UserController.updateUser));
router.use(permission('staff'));
router.get('/numbers/customers', asyncHandler(UserController.getNumberOfCustomers));
router.use(permission('manager'));
router.get('/numbers/staffs', asyncHandler(UserController.getNumberOfStaffs));
router.get('/numbers/managers', asyncHandler(UserController.getNumberOfManagers));
router.get('/:user_id', asyncHandler(UserController.getUserByManager));
router.get('/role/:role', asyncHandler(UserController.getAllUsers));

module.exports = router;