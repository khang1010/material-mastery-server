'use strict';

const { BadRequestError } = require("../../core/error-response");
const cartModel = require("../cart.model");
const { getProductById } = require("./product");
const { Types } = require("mongoose");

const createUserCart = async ({ userId, product }) => {
    const query = {cart_userId: userId};
    const foundProduct = await getProductById(product.productId, ["createdAt", "updatedAt", "__v", "product_slug", "_id"])
    foundProduct.product_quantity = product.quantity
    foundProduct.productId = product.productId
    const updateOrInsert = {
        $addToSet: {
            cart_products: foundProduct
        },
        $inc: {
            cart_count_products: product.quantity
        }
    }, options = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
}

const updateProductQuantityInCart = async ({ userId, product }) => {
    const { productId, quantity } = product;
    const isProductExists = await cartModel.exists({
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
    });
    // console.log(">>>product: ", product)
    if (!isProductExists) throw new BadRequestError('Product not found in cart'); 
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
    },
    updateSet = {
        $inc: {
            cart_count_products: quantity,
            'cart_products.$.product_quantity': quantity,

        }
    }, options = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateSet, options);
}

const deleteProductInCart = async ({userId, product}) => {
    const foundCart = await cartModel.findOne({
        cart_userId: userId,
        'cart_products.productId': product.productId,
        cart_state: 'active'
    })
    const foundProduct = foundCart.cart_products.find(p => p.productId === product.productId)
    const query = {
        cart_userId: userId,
        cart_state: 'active'
    }, updateSet = {
        $pull: {
            cart_products: {
                productId: product.productId
            }
        },
        $inc: {
            cart_count_products: -foundProduct.product_quantity
        }
    }, options = { upsert: true, new: true };

    return await cartModel.updateOne(query, updateSet, options);
}

const getUserCart = async (userId) => {
    return await cartModel.findOne({ cart_userId: userId }).lean();
}

// const addProductToCart = async (userId, product) => {
//     const query = {
//         cart_userId: userId,
//         cart_state: 'active'
//     }, updateSet = {
//         $push: {
//             cart_products: product
//         },
//         $inc: {
//             cart_count_products: product.quantity
//         }
//     }, options = { upsert: true, new: true };

//     return await cartModel.updateOne(query, updateSet, options);
// }

module.exports = {
    createUserCart,
    updateProductQuantityInCart,
    deleteProductInCart,
    getUserCart,
    // addProductToCart,
}