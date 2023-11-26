'use strict';

const { BadRequestError, NotFoundError } = require("../../core/error-response");
const favoriteProductsModel = require("../favoriteProducts.model");
const { getProductById } = require("./product");
const { Types } = require("mongoose");

const createUserFavoriteList = async ({ userId, product }) => {
    const query = {userId: userId};
    const foundProduct = await getProductById(product.productId, ["createdAt", "updatedAt", "__v", "product_slug", "_id", "product_quantity"]);
    foundProduct.productId = product.productId
    const updateOrInsert = {
        $addToSet: {
            products: foundProduct
        },
        $inc: {
            count_products: 1
        }
    }, options = { upsert: true, new: true };
    return await favoriteProductsModel.findOneAndUpdate(query, updateOrInsert, options);
}

const deleteProductInFavoriteList = async ({userId, product}) => {
    const foundList = await favoriteProductsModel.findOne({
        userId: userId,
        'products.productId': product.productId,
    })
    if (!foundList) throw new NotFoundError('Product not found in favorite list');
    
    const query = {
        userId: userId,
    }, updateSet = {
        $pull: {
            products: {
                productId: product.productId
            }
        },
        $inc: {
            count_products: -1
        }
    }, options = { upsert: true, new: true };

    return await favoriteProductsModel.updateOne(query, updateSet, options);
}

const getUserFavoriteList = async (userId) => {
    return await favoriteProductsModel.findOne({ userId: userId }).lean();
}

module.exports = {
    createUserFavoriteList,
    deleteProductInFavoriteList,
    getUserFavoriteList,
}