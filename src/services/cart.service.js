'use strict';

const { NotFoundError } = require("../core/error-response");
const cartModel = require("../models/cart.model");
const { createUserCart, getUserCart, deleteProductInCart, updateProductQuantityInCart } = require("../models/repositories/cart");
const { getProductById } = require("../models/repositories/product");

class CartService {
    static async addToCart({ userId, product }) {
        const userCart = await getUserCart(userId);
        if (!userCart) {
            return await createUserCart({ userId, product });
        }

        if (!userCart.cart_count_products) {
            return await createUserCart({ userId, product });
        }
        const isProductExists = await cartModel.exists({
            cart_userId: userId,
            'cart_products.productId': product.productId,
            cart_state: 'active'
        });
        if (!isProductExists) {
            return await createUserCart({ userId, product });
        }

        return await updateProductQuantityInCart({ userId, product });
    }

    static async updateProductQuantityInCart({ userId, product }) {
        const {productId, quantity, oldQuantity} = product;
        const foundProduct = await getProductById(productId, []);
        if (!foundProduct) throw new NotFoundError('Not found product');
        if (!quantity) return await deleteProductInCart({ userId, product: product });

        return await updateProductQuantityInCart({ userId, product: {
            productId,
            quantity: quantity - oldQuantity,
        } });
    }

    static async getUserCart(userId) {
        return await getUserCart(userId);
    }

    static async deleteProductInCart({ userId, product }) {
        return await deleteProductInCart({ userId, product });
    }
}

module.exports = CartService;