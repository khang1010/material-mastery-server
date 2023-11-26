'use strict';
const { OkResponse } = require("../core/success-response");
const FavoriteService = require("../services/favorite.service");

class FavoriteController {
    static addToFavoriteList = async (req, res, next) => {
        new OkResponse({
            message: "Add to favorite list successfully",
            metadata: await FavoriteService.addToFavoriteList({userId: req.user.userId, product: req.body})
        }).send(res);
    }

    static getUserFavoriteList = async (req, res, next) => {
        new OkResponse({
            message: "Get user favorite list successfully",
            metadata: await FavoriteService.getUserFavoriteList(req.user.userId),
        }).send(res);
    }

    static deleteProductInFavoriteList = async (req, res, next) => {
        new OkResponse({
            message: "Delete product in favorite list successfully",
            metadata: await FavoriteService.deleteProductInList({userId: req.user.userId, product: req.body})
        }).send(res);
    }
}

module.exports = FavoriteController;