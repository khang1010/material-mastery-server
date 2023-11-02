'use strict';

const categoryModel = require("../category.model");

const createCategory = async ({name, description = '', parent = null}) => {
    return await categoryModel.create({
        category_description: description,
        category_name: name,
        parent_category: parent
    })
}

const getAllCategory = async () => {
    return await categoryModel.find().populate('parent_category').lean();
}

const deleteCategory = async (categoryId) => {
    return await categoryModel.findByIdAndDelete(categoryId);
}

const findByName = async (name) => {
    return await categoryModel.findOne({category_name: name}).lean();
}

module.exports = {
    createCategory,
    getAllCategory,
    deleteCategory,
    findByName,
}