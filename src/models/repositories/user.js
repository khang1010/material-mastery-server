'use strict';
const bcrypt = require('bcrypt');

const {
  getSortAscending,
  getUnSelectData,
  getSortDescending,
  getSelectData,
} = require('../../utils');
const { user } = require('../user.model');
const { BadRequestError } = require('../../core/error-response');

const findByEmailOrUsername = async (userInfo) => {
  return await user
    .findOne({ $or: [{ email: userInfo }, { username: userInfo }] })
    .lean();
};

const findUserById = async (user_id) => {
  return await user.findById(user_id).lean();
};

const updateUserById = async (user_id, model, payload) => {
  const { password, address_info } = payload;
  const { longitude, latitude } = address_info;
  let passwordHash = undefined;
  if (password) {
    //Hash password
    passwordHash = await bcrypt.hash(password, 10);
  }
  if (address_info) {
    if (!longitude || !latitude)
      throw new BadRequestError('Please provide longitude and latitude');
  }

  return await model.findByIdAndUpdate(
    user_id,
    { ...payload, password: passwordHash },
    { new: true }
  );
};

const getAllUsers = async ({
  limit = 50,
  page = 1,
  sorted = ['_id'],
  filter = {},
  unSelect = [],
  isAscending = true,
}) => {
  // isAscending === 'true' ? console.log(">>>sort: ", getSortAscending(sorted)) : console.log(">>>sort: ", getSortDescending(sorted));
  return await user
    .find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(
      isAscending === 'true'
        ? getSortAscending(sorted)
        : getSortDescending(sorted)
    )
    .select(getUnSelectData(unSelect))
    .lean();
};

const getAllUsersWithoutPagination = async ({ filter = {}, select = [] }) => {
  return await user.find(filter).select(getSelectData(select)).lean();
};

module.exports = {
  findByEmailOrUsername,
  updateUserById,
  findUserById,
  getAllUsers,
  getAllUsersWithoutPagination,
};
