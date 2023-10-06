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
}

module.exports = AccessController;