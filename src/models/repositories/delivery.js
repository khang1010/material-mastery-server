const deliveryModel = require('../delivery.model');
const {
  getSortAscending,
  getSortDescending,
  getUnSelectData,
} = require('../../utils');

const createDelivery = async ({
  userId,
  orderIds,
  rating = 0,
  routes = [],
  status = 'draft',
  startLocation = null,
}) => {
  return await deliveryModel.create({
    userId,
    orderIds,
    routes: routes.length > 0 ? routes : null,
    status,
    rating,
    startLocation: !startLocation
      ? routes && routes.length > 0
        ? routes[0]
        : null
      : startLocation,
  });
};

const getAllDeliveries = async () => {
  return await deliveryModel.find().lean();
};

const deleteDeliveryById = async (id) => {
  return await deliveryModel.findByIdAndDelete(id);
};

const findDeliveryById = async (id) => {
  return await deliveryModel.findOne({ _id: id }).lean();
};

const findByUserId = async (userId, status = null) => {
  if (status !== null) {
    return await deliveryModel
      .find({
        userId: userId,
        status,
      })
      .lean();
  }
  return await deliveryModel
    .find({
      userId: userId,
    })
    .lean();
};

const updateDeliveryById = async (id, data) => {
  return await deliveryModel.findByIdAndUpdate(id, data, { new: true });
};

const getAllDeliveriesByFilter = async ({ limit = 50, page = 1, filter }) => {
  return await deliveryModel
    .find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

const getDeliveriesByUser = async ({
  limit = 50,
  page = 1,
  sorted = ['createdAt'],
  filter = {},
  unSelect = [],
  isAscending = true,
}) => {
  return await deliveryModel
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

module.exports = {
  createDelivery,
  findDeliveryById,
  findByUserId,
  getAllDeliveries,
  getAllDeliveriesByFilter,
  updateDeliveryById,
  deleteDeliveryById,
  getDeliveriesByUser,
};
