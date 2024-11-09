'use strict';

const { getSelectData } = require('../../utils');
const categoryModel = require('../category.model');

const createCategory = async ({ name, description = '', parent = null }) => {
  return await categoryModel.create({
    category_description: description,
    category_name: name,
    parent_category: parent,
  });
};

const getAllCategory = async () => {
  // const foundCategory = await categoryModel.findOneAndUpdate({
  //     _id: convertToObjectId("6593e3da3b0ac5982fec29d7")
  // }, {_id: convertToObjectId("654272bffe4d153ff2b3078e")}, {new: true});
  return await categoryModel.find().populate('parent_category').lean();
};

const deleteCategory = async (categoryId) => {
  return await categoryModel.findByIdAndDelete(categoryId);
};

const findByName = async (name) => {
  return await categoryModel.findOne({ category_name: name }).lean();
};

const getCategoryById = async (id, select) => {
  return await categoryModel.findById(id).select(getSelectData(select)).lean();
};

const updateCategoryById = async (id, data) => {
  return await categoryModel.findByIdAndUpdate(id, data, { new: true });
};

const getAllCategoriesByFilter = async ({
  limit = 50,
  page = 1,
  filter,
  select,
}) => {
  return await categoryModel
    .find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
};

module.exports = {
  createCategory,
  getAllCategory,
  deleteCategory,
  findByName,
  getCategoryById,
  getAllCategoriesByFilter,
  updateCategoryById,
};
