'use strict';

const { BadRequestError } = require("../core/error-response");
const { findProductByName, createProduct, getAllProduct, deleteProductById, updateProductById } = require("../models/repositories/product");
const { removeUndefinedObject, updateNestedObject } = require("../utils");

class ProductService {
    static async createProduct(payload) {
        const {name} = payload;
        const foundProduct = await findProductByName(name);
        if (foundProduct) throw new BadRequestError("Product already exists");
        const newProduct = await createProduct(payload);
        if (!newProduct) throw new BadRequestError("Create product failed");
        return newProduct;
    }

    static async getAllProducts() {
        return await getAllProduct();
    }

    static async deleteProductById(id) {
        return await deleteProductById(id);
    }

    static async updateProductById(id, payload) {
        const tempPayload = removeUndefinedObject(payload);
        return await updateProductById(id, updateNestedObject(tempPayload));
    }
}

module.exports = ProductService;