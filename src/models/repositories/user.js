'use strict'

const { user } = require("../user.model");

const findByEmailOrUsername = async (userInfo) => {
    return await user.findOne({ $or: [{ email: userInfo }, { username: userInfo }] }).lean();
}

module.exports = {
    findByEmailOrUsername,
}