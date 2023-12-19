'use strict';
const { default: mongoose } = require("mongoose");
const { OkResponse } = require("../core/success-response");
const NotificationService = require("../services/notification.service");

class NotificationController {
    static getByType = async (req, res, next) => {
        new OkResponse({
            message: "Get notifications successfully",
            metadata: await NotificationService.getByType(req.params.type, req.user.roles)
        }).send(res);
    }
    // static getNotificationStaff = async (req, res, next) => {

    //     const notificationChangeStream = mongoose.connection.collection('notifications').watch();
    //     notificationChangeStream.on('change', (change) => {
    //         if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
    //             console.log(">>>change: ", change.fullDocument);
    //             _io.emit('notificationChange', change.fullDocument);
    //         }
    //     });
    //     return res.json({
    //         code: 200,
    //     })
    // }
}

module.exports = NotificationController;