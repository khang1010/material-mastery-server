'use strict'

const { OkResponse } = require("../core/success-response");
const UserFactory = require("../services/user.service");

class UserController {
    static updateUser = async (req, res, next) => {
        new OkResponse({
            message: "Update user successfully",
            metadata: await UserFactory.updateUser(req.user.userId, req.params.user_id, req.body),
        }).send(res);
    }
}

module.exports = UserController;