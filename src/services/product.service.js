'use strict';

const { BadRequestError, NotFoundError } = require("../core/error-response");
const { getAllCategoriesByFilter, getCategoryById } = require("../models/repositories/category");
const { findProductByName, createProduct, getAllProduct, deleteProductById, updateProductById, getProductById, getAllProductsByUser } = require("../models/repositories/product");
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

    static async getProductById(productId) {
        const foundProduct = await getProductById(productId, []);
        if (!foundProduct) throw new NotFoundError("Product not found")
        const category = await getAllCategoriesByFilter({filter: {
            _id: {$in: foundProduct.product_categories}
        }, select: ['_id', 'category_name']})
        if (!category) throw new NotFoundError('Product category not found');
        return {
            ...foundProduct,
            product_categories: category
        }
    }

    static async getProductByCategoryId(categoryId) {
        const foundCategory = await getCategoryById(categoryId, ["category_name"]);
        if (!foundCategory) throw new NotFoundError("Category not found");
        return await getAllProductsByUser({filter: {
            product_categories: {$in: [categoryId]}
        }, unSelect: ["product_categories", "__v"]});
    }
}

module.exports = ProductService;