'use strict';

const { OkResponse } = require("../core/success-response");
const AccessService = require("../services/access.service");

class AccessController {
    static signUp = async (req, res, next) => {
        new OkResponse({
            message: "Sign up successfully",
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    }
    static signIn = async (req, res, next) => {
        new OkResponse({
            message: "Sign in successfully",
            metadata: await AccessService.signIn(req.body),
        }).send(res);
    }
    static signOut = async (req, res, next) => {
        new OkResponse({
            message: "Sign out successfully",
            metadata: await AccessService.signOut(req.keyStore),
        }).send(res);
    }
}

module.exports = AccessController;