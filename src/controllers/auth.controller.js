'use strict';

const { OkResponse } = require('../core/success-response');
const AuthService = require('../services/auth.service');

class AuthController {
  static sendVerificationEmail = async (req, res, next) => {
    new OkResponse({
      message: 'Send verification email successfully',
      metadata: await AuthService.sendVerificationEmail(
        req.params.email,
        req.query.isCheckExist
      ),
    }).send(res);
  };
  static verifyEmail = async (req, res, next) => {
    new OkResponse({
      message: 'Verify email successfully',
      metadata: await AuthService.verifyEmailCode(req.params.code),
    }).send(res);
  };
  static verifyEmailWithoutDeleteCode = async (req, res, next) => {
    new OkResponse({
      message: 'Verify email successfully',
      metadata: await AuthService.verifyEmailCodeWithoutDeleteCode(
        req.params.code
      ),
    }).send(res);
  };
  static verifyCodeAndUpdatePassword = async (req, res, next) => {
    new OkResponse({
      message: 'Reset password successfully',
      metadata: await AuthService.verifyCodeAndUpdatePassword(
        req.params.code,
        req.body.userEmail,
        req.body.newPassword
      ),
    }).send(res);
  };
}

module.exports = AuthController;
