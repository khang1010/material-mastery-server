'use strict'

const { getSortAscending, getUnSelectData, getSortDescending } = require("../../utils");
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

const getAllUsers = async ({limit = 50, page = 1, sorted = ["_id"], filter = {}, unSelect = [], isAscending = true}) => {
    // isAscending === 'true' ? console.log(">>>sort: ", getSortAscending(sorted)) : console.log(">>>sort: ", getSortDescending(sorted));
    return await user.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(isAscending === 'true' ? getSortAscending(sorted) : getSortDescending(sorted))
    .select(getUnSelectData(unSelect))
    .lean()
}

module.exports = {
    findByEmailOrUsername,
    updateUserById,
    findUserById,
    getAllUsers
}