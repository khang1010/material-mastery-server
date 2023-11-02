'use strict';

const { BadRequestError } = require("../core/error-response");
const { findByName, createCategory, getAllCategory, deleteCategory } = require("../models/repositories/category");

class CategoryService {
    static create = async (payload) => {
        const {name} = payload;
        const foundCategory = await findByName(name);
        if (foundCategory) throw new BadRequestError("Category already exists");
        const newCategory = await createCategory(payload);
        if (!newCategory) throw new BadRequestError("Create category failed");
        return newCategory;
    }

    static getAllCategories = async () => {
        return await getAllCategory();
    }

    static deleteCategory = async (id) => {
        return await deleteCategory(id);
    }
}

module.exports = CategoryService;