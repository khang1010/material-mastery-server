'use strict';

const { NotFoundError, BadRequestError } = require("../core/error-response");
const cartModel = require("../models/cart.model");
const inventoryModel = require("../models/inventory.model");
const { createUserCart, getUserCart, deleteProductInCart, updateProductQuantityInCart } = require("../models/repositories/cart");
const { findInventoryByProductId } = require("../models/repositories/inventory");
const { getProductById } = require("../models/repositories/product");

class CartService {
    static async addToCart({ userId, product }) {
        const inventory = await findInventoryByProductId(product.productId);
        if (!inventory) throw new BadRequestError("Product not found");
        if (inventory.inventory_stock < product.quantity) throw new BadRequestError("Insufficient product inventory")
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