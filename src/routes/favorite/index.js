const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/checkAuth');
const FavoriteController = require('../../controllers/favorite.controller');

const router = express.Router();

router.use(authentication);
router.get('/', asyncHandler(FavoriteController.getUserFavoriteList));
router.post('/', asyncHandler(FavoriteController.addToFavoriteList));
router.delete('/', asyncHandler(FavoriteController.deleteProductInFavoriteList));

module.exports = router;