const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const AuthController = require('../../controllers/auth.controller');
const router = express.Router();

router.get('/send/:email', asyncHandler(AuthController.sendVerificationEmail));
router.get('/verify/:code', asyncHandler(AuthController.verifyEmail));
router.get(
  '/reset-password/verify/:code',
  asyncHandler(AuthController.verifyEmail)
);
router.patch(
  '/reset-password/:code',
  asyncHandler(AuthController.verifyCodeAndUpdatePassword)
);

module.exports = router;
