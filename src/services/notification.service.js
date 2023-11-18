'use strict';

const { BadRequestError } = require("../core/error-response");
const { getNotificationByType } = require("../models/repositories/notification");

class NotificationService {
    static getByType = async (type, roles) => {
        // console.log(">>>type: ", type);
        // console.log(">>>roles: ", roles);
        if (type === "STAFF" && !roles.includes('staff') && !roles.includes('manager')) throw new BadRequestError(
            "Permission denied"
        )
        if (type === "MANAGER" && !roles.includes('manager')) throw new BadRequestError(
            "Permission denied"
        )
        return await getNotificationByType(type);
    }
}

module.exports = NotificationService;