'use strict';

const { Types } = require("mongoose");
const notificationModel = require("../notification.model");

const createOrUpdateNotificationByReceivedId = async ({type = "SYSTEM", receivedId, content, option}) => {
    const query = {noti_receivedId: receivedId};
    const updateOrInsert = {
        $addToSet: {
            noti_options: option
        },
        noti_receivedId: receivedId,
        noti_type: type,
        noti_content: content
    }, options = { upsert: true, new: true };
    return await notificationModel.findOneAndUpdate(query, updateOrInsert, options);
}

const createOrUpdateNotificationByType = async ({type = "SYSTEM", receivedId = null, content, option}) => {
    // console.log(">>>option: ", option);
    const {productId} = option;
    const isNotificationExists = await notificationModel.exists({
        noti_type: type, 'noti_options.productId': new Types.ObjectId(productId)
    });
    if (!isNotificationExists) {
        const query = {noti_type: type};
        const updateOrInsert = {
            $addToSet: {
                noti_options: option
            },
            noti_receivedId: receivedId,
            noti_type: type,
            noti_content: content
        }, options = { upsert: true, new: true };
        return await notificationModel.findOneAndUpdate(query, updateOrInsert, options);
    }
    const query = {noti_type: type, 'noti_options.productId': new Types.ObjectId(productId)};
    const updateOrInsert = {
        // $addToSet: {
        //     noti_options: option
        // },
        'noti_options.$': option,
        noti_receivedId: receivedId,
        noti_type: type,
        noti_content: content
    }, options = { upsert: true, new: true };
    return await notificationModel.findOneAndUpdate(query, updateOrInsert, options);
}

const getNotificationByReceivedId = async (receivedId) => {
    const query = {noti_receivedId: receivedId};
    return await notificationModel.findOne(query).lean();
}

const getNotificationByType = async (type = "SYSTEM") => {
    return await notificationModel.find({noti_type: type}).lean();
}

const checkProductExists = async (type, productId, content) => {
    const isNotificationExists = await notificationModel.exists({
        noti_type: type, 'noti_options.productId': new Types.ObjectId(productId), noti_content: content
    });
    // console.log(">>>isNotificationExists: ", isNotificationExists);
    return isNotificationExists;
}

const deleteProductInStaffNotification = async (productId, content) => {
    // const foundNotification = await cartModel.findOne({
    //     noti_type: "STAFF",
    //     'noti_options.productId': productId,
    // })
    // if (!foundNotification) throw new NotFoundError('Notification not found');
    // console.log(">>>productId: ", productId);
    const query = {
        noti_type: "STAFF",
        'noti_options.productId': new Types.ObjectId(productId),
        noti_content: content
    }, updateSet = {
        $pull: {
            noti_options: {
                productId: new Types.ObjectId(productId)
            }
        },
    }, options = { upsert: true, new: true };

    const notification = await notificationModel.findOneAndUpdate(query, updateSet, options);
    // console.log(">>> notification: ", notification.noti_options == []);
    if (notification.noti_options.length === 0) return await notificationModel.findOneAndDelete({noti_type: "STAFF", noti_content: content});
    return notification;
}

module.exports = {
    createOrUpdateNotificationByReceivedId,
    createOrUpdateNotificationByType,
    getNotificationByReceivedId,
    getNotificationByType,
    deleteProductInStaffNotification,
    checkProductExists,
}