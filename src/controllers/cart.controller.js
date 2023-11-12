'use strict';

const { OkResponse } = require("../core/success-response");
const CartService = require("../services/cart.service");

class CartController {
    static addToCart = async (req, res, next) => {
        new OkResponse({
            message: "Add to cart successfully",
            metadata: await CartService.addToCart({userId: req.user.userId, product: req.body})
        }).send(res);
    }

    static getUserCart = async (req, res, next) => {
        new OkResponse({
            message: "Get user cart successfully",
            metadata: await CartService.getUserCart(req.user.userId),
        }).send(res);
    }

    static updateQuantityProduct = async (req, res, next) => {
        new OkResponse({
            message: "Update quantity product successfully",
            metadata: await CartService.updateProductQuantityInCart({userId: req.user.userId, product: req.body})
        }).send(res);
    }

    static deleteProductInCart = async (req, res, next) => {
        new OkResponse({
            message: "Delete product in cart successfully",
            metadata: await CartService.deleteProductInCart({userId: req.user.userId, product: req.body})
        }).send(res);
    }
}

module.exports = CartController;