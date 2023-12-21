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
            metadata: await ProductService.getAllProducts(req.query),
        }).send(res);
    }

    static getAllDraft = async (req, res, next) => {
        new OkResponse({
            message: "Get products successfully",
            metadata: await ProductService.getAllDraftProducts(req.query),
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

    static getProductById = async (req, res, next) => {
        new OkResponse({
            message: "Get product successfully",
            metadata: await ProductService.getProductById(req.params.id),
        }).send(res);
    }
    static getProductByCategoryId = async (req, res, next) => {
        new OkResponse({
            message: "Get product by category successfully",
            metadata: await ProductService.getProductByCategoryId(req.params.id, req.query),
        }).send(res);
    }
    static publishProduct = async (req, res, next) => {
        new OkResponse({
            message: "Publish product successfully",
            metadata: await ProductService.publishProduct({id: req.params.id}),
        }).send(res);
    }
    static unPublishProduct = async (req, res, next) => {
        new OkResponse({
            message: "Unpublish product successfully",
            metadata: await ProductService.unPublishProduct({id: req.params.id}),
        }).send(res);
    }
    static getNumberOfProducts = async (req, res, next) => {
        new OkResponse({
            message: "Get number of products successfully",
            metadata: await ProductService.getNumberOfProducts(),
        }).send(res);
    }
    static getNumberOfProductsByCategory = async (req, res, next) => {
        new OkResponse({
            message: "Get number of products by category successfully",
            metadata: await ProductService.getNumberOfProductsByCategoryId(req.params.category),
        }).send(res);
    }
    static searchProductsByUser = async (req, res, next) => {
        new OkResponse({
            message: "Search products successfully",
            metadata: await ProductService.searchProductsByUser({keySearch: req.query.keySearch}),
        }).send(res);
    }
    static getSellingProducts = async (req, res, next) => {
        new OkResponse({
            message: "Get selling products successfully",
            metadata: await ProductService.getSellingProducts(req.query),
        }).send(res);
    }
}

module.exports = ProductController;