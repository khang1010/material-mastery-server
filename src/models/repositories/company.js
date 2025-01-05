const {
  getSortAscending,
  getSortDescending,
  getUnSelectData,
} = require('../../utils');
const companyModel = require('../company.model');

const createCompany = async (payload) => {
  return await companyModel.create(payload);
};

const deleteCompanyById = async (id) => {
  return await companyModel.findByIdAndDelete(id);
};

const getCompaniesByUser = async ({
  limit = 50,
  page = 1,
  sorted = ['_id'],
  filter = {},
  unSelect = [],
  isAscending = true,
}) => {
  return await companyModel
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

const getCompaniesByIds = async (companyIds) => {
  return await companyModel
    .find({
      _id: {
        $in: companyIds,
      },
    })
    .lean();
};

const updateCompanyById = async (id, payload) => {
  return await companyModel.findByIdAndUpdate(id, payload, { new: true });
};

module.exports = {
  getCompaniesByIds,
  getCompaniesByUser,
  updateCompanyById,
  createCompany,
  deleteCompanyById,
};
