const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const AuthController = require('../../controllers/auth.controller');
const router = express.Router();

router.get('/send/:email', asyncHandler(AuthController.sendVerificationEmail));
router.get('/verify/:code', asyncHandler(AuthController.verifyEmail));

module.exports = router;