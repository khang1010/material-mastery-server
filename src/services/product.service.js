'use strict';
const { BadRequestError, NotFoundError } = require("../core/error-response");
const { getAllCategoriesByFilter, getCategoryById } = require("../models/repositories/category");
const { updateInventoryByProductId } = require("../models/repositories/inventory");
const { createOrUpdateNotificationByType, checkProductExists, deleteProductInStaffNotification } = require("../models/repositories/notification");
const { findProductByName, createProduct, getAllProduct, deleteProductById, updateProductById, getProductById, getAllProductsByUser } = require("../models/repositories/product");
const { removeUndefinedObject, updateNestedObject } = require("../utils");
const content = {
    "STAFF-001": "There is a risk of product shortage in quantity (<=5)",
}

class ProductService {
    static async createProduct(payload) {
        const {name} = payload;
        const foundProduct = await findProductByName(name);
        if (foundProduct) throw new BadRequestError("Product already exists");
        const newProduct = await createProduct(payload);
        if (!newProduct) throw new BadRequestError("Create product failed");
        if (newProduct.product_quantity <= 5) {
            await createOrUpdateNotificationByType({
                type: "STAFF",
                content: "STAFF-001",
                option: {...newProduct, productId: newProduct._id}
            })
        }
        return newProduct;
    }

    static async getAllProducts() {
        return await getAllProduct();
    }

    static async deleteProductById(id) {
        const product = await deleteProductById(id);
        if (await checkProductExists("STAFF", id, "STAFF-001")) {
            await deleteProductInStaffNotification(id, "STAFF-001");
        }
        return product;
    }

    static async updateProductById(id, payload) {
        const tempPayload = removeUndefinedObject(payload);
        const product = await updateProductById(id, updateNestedObject(tempPayload));
        if (!product) throw new BadRequestError("Update product failed");
        if (payload.product_quantity) {
            await updateInventoryByProductId(id, payload.product_quantity);
            if (payload.product_quantity <= 5) {
                await createOrUpdateNotificationByType({
                    type: "STAFF",
                    content: "STAFF-001",
                    option: {...product._doc, productId: product._id}
                })
            } else if (await checkProductExists("STAFF", id, "STAFF-001")) {
                await deleteProductInStaffNotification(id, "STAFF-001");
            }
        }
        return product;
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