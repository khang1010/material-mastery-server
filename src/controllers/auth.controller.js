'use strict';

const { OkResponse } = require("../core/success-response");
const AuthService = require("../services/auth.service");

class AuthController {
    static sendVerificationEmail = async (req, res, next) => {
        new OkResponse({
            message: "Send verification email successfully",
            metadata: await AuthService.sendVerificationEmail(req.params.email)
        }).send(res);
    }
    static verifyEmail = async (req, res, next) => {
        new OkResponse({
            message: "Verify email successfully",
            metadata: await AuthService.verifyEmailCode(req.params.code)
        }).send(res);
    }
}

module.exports = AuthController;