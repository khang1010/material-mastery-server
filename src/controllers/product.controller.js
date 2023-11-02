'use strict';

const { CreatedResponse, OkResponse } = require("../core/success-response");
const ProductService = require("../services/product.service");

class ProductController {
    static create = async (req, res, next) => {
        new CreatedResponse({
            message: "Create product successfully",
            metadata: await ProductService.createProduct(req.body),
        }).send(res);
    }

    static getAll = async (req, res, next) => {
        new OkResponse({
            message: "Get all products successfully",
            metadata: await ProductService.getAllProducts(),
        }).send(res);
    }

    static deleteById = async (req, res, next) => {
        new OkResponse({
            message: "Delete product successfully",
            metadata: await ProductService.deleteProductById(req.params.id),
        }).send(res);
    }

    static update = async (req, res, next) => {
        new OkResponse({
            message: "Update product successfully",
            metadata: await ProductService.updateProductById(req.params.id, req.body),
        }).send(res);
    }
}

module.exports = ProductController;