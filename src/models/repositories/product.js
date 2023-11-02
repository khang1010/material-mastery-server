'use strict';

const { product } = require("../product.model");
const { createInventory } = require("./inventory");

const findProductByName = async (product_name) => {
    return await product.findOne({product_name}).lean();
}

const createProduct = async ({name, thumb = "", description = "", price, quantity, brand = "empty", unit, categories}) => {
    const newProduct =  await product.create({
        product_name: name,
        product_thumb: thumb,
        product_description: description,
        product_price: price,
        product_quantity: quantity,
        product_brand: brand,
        product_unit: unit,
        product_categories: categories,
    });
    const newInventory = await createInventory({productId: newProduct._id, stock: newProduct.product_quantity});
    return newProduct;
}

const getAllProduct = async () => {
    return await product.find().lean();
}

const updateProductById = async (productId, payload) => {
    return await product.findByIdAndUpdate(productId, payload, {new: true});
}

const deleteProductById = async (productId) => {
    return await product.findByIdAndDelete(productId);
}

module.exports = {
    findProductByName,
    createProduct,
    getAllProduct,
    updateProductById,
    deleteProductById,
}