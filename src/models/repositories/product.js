'use strict';

const { Types } = require("mongoose");
const { getUnSelectData, getSelectData, getSortAscending, getSortDescending } = require("../../utils");
const { product } = require("../product.model");
const { createInventory } = require("./inventory");
const { NotFoundError } = require("../../core/error-response");

const findProductByName = async (product_name) => {
    return await product.findOne({product_name}).lean();
}

const createProduct = async ({name, thumb = "", description = "", price, quantity, brand = "empty", unit, categories, isDraft = false}) => {
    const newProduct =  await product.create({
        product_name: name,
        product_thumb: thumb,
        product_description: description,
        product_price: price,
        product_quantity: quantity,
        product_brand: brand,
        product_unit: unit,
        product_categories: categories,
        isDraft: isDraft
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

const getProductById = async (productId, select) => {
    return await product.findById(productId).select(getUnSelectData(select)).lean();
}

const getAllProductsByUser = async ({limit = 50, page = 1, sorted = ["_id"], filter = {}, unSelect = [], isAscending = true}) => {
    // isAscending === 'true' ? console.log(">>>sort: ", getSortAscending(sorted)) : console.log(">>>sort: ", getSortDescending(sorted));
    return await product.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(isAscending === 'true' ? getSortAscending(sorted) : getSortDescending(sorted))
    .select(getUnSelectData(unSelect))
    .lean()
}

const publishProduct = async ({id}) => {
    const foundProduct = await product.findById(id)
    if (!foundProduct) throw new NotFoundError('Product not found')
    foundProduct.isDraft = false

    const {modifiedCount} = await foundProduct.updateOne(foundProduct)
    return modifiedCount
}

const unPublishProduct = async ({id}) => {
    const foundProduct = await product.findById(id)
    if (!foundProduct) throw new NotFoundError('Product not found')
    foundProduct.isDraft = true

    const {modifiedCount} = await foundProduct.updateOne(foundProduct)
    return modifiedCount
}

module.exports = {
    findProductByName,
    createProduct,
    getAllProduct,
    updateProductById,
    deleteProductById,
    getProductById,
    getAllProductsByUser,
    publishProduct,
    unPublishProduct,
}