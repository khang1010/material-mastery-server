'use strict';

const { BadRequestError } = require("../core/error-response");
const { findByName, createCategory, getAllCategory, deleteCategory, updateCategoryById } = require("../models/repositories/category");
const { getNumberOfProductsByCategory, getAllProductsByUser } = require("../models/repositories/product");
const { removeUndefinedObject } = require("../utils");

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
        const foundProducts = await getAllProductsByUser({filter: {
            product_categories: {$in: [id]},
        }, unSelect: ["product_categories", "__v"]});
        if (foundProducts.length > 0) throw new BadRequestError('Category has products');
        return await deleteCategory(id);
    }
    static updateCategory = async (id, data) => {
        return await updateCategoryById(id, removeUndefinedObject(data));
    }
}

module.exports = CategoryService;