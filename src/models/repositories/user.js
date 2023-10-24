'use strict'

const { user } = require("../user.model");

const findByEmailOrUsername = async (userInfo) => {
    return await user.findOne({ $or: [{ email: userInfo }, { username: userInfo }] }).lean();
}

const findUserById = async (user_id) => {
    return await user.findById(user_id).lean();
}

const updateUserById = async (user_id, model, payload) => {
    return await model.findByIdAndUpdate(user_id, payload, {new: true})
}

module.exports = {
    findByEmailOrUsername,
    updateUserById,
    findUserById,
}