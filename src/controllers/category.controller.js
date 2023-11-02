'use strict';

const { CreatedResponse, OkResponse } = require("../core/success-response");
const CategoryService = require("../services/category.service");

class CategoryController {
    static create = async (req, res, next) => {
        new CreatedResponse({
            message: "Create Category successfully",
            metadata: await CategoryService.create(req.body)
        }).send(res)
    }
    static getAll = async (req, res, next) => {
        new OkResponse({
            message: "Get all categories successfully",
            metadata: await CategoryService.getAllCategories()
        }).send(res)
    }
    static delete = async (req, res, next) => {
        new OkResponse({
            message: "Delete category successfully",
            metadata: await CategoryService.deleteCategory(req.params.category_id)
        }).send(res)
    }
}

module.exports = CategoryController;