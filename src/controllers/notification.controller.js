'use strict';
const { OkResponse } = require("../core/success-response");
const NotificationService = require("../services/notification.service");

class NotificationController {
    static getByType = async (req, res, next) => {
        new OkResponse({
            message: "Get notifications successfully",
            metadata: await NotificationService.getByType(req.params.type, req.user.roles)
        }).send(res);
    }
}

module.exports = NotificationController;