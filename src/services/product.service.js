'use strict';

const { BadRequestError } = require("../core/error-response");
const { product } = require("../models/product.model");
const { createInventory } = require("../models/repositories/inventory");
const { findProductByName } = require("../models/repositories/product");

class ProductService {
    static async createProduct({product_name, product_thumb, product_description, product_price, product_brand, product_unit, product_categories, product_quantity}) {
        const foundProduct = await findProductByName(product_name);
        if (foundProduct) throw new BadRequestError("Product already exists");
        const newProduct = await product.create({
            product_name,
            product_thumb,
            product_description,
            product_price,
            product_brand,
            product_unit,
            product_quantity,
            product_categories,
        });
        if (!newProduct) throw new BadRequestError("Create product failed");
        await createInventory({productId: newProduct._id, stock: newProduct.product_quantity});
        return newProduct;
    }
}

module.exports = ProductService;