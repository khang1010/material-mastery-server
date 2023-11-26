'use strict';
const { NotFoundError, BadRequestError } = require("../core/error-response");
const { getUserFavoriteList, createUserFavoriteList, deleteProductInFavoriteList } = require("../models/repositories/favorite");

class FavoriteService {
    static async addToFavoriteList({ userId, product }) {
        const userList = await getUserFavoriteList(userId);
        if (!userList) {
            return await createUserFavoriteList({ userId, product });
        }

        if (!userList.count_products) {
            return await createUserFavoriteList({ userId, product });
        }
        const foundProduct = userList.products.find(p => p.productId === product.productId);
        if (foundProduct) throw new BadRequestError('Product already exists in favorite list');
        return await createUserFavoriteList({ userId, product });
    }

    static async getUserFavoriteList(userId) {
        return await getUserFavoriteList(userId);
    }

    static async deleteProductInList({ userId, product }) {
        return await deleteProductInFavoriteList({ userId, product });
    }
}

module.exports = FavoriteService;