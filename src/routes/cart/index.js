const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const CartController = require('../../controllers/cart.controller');
const { authentication } = require('../../auth/checkAuth');

const router = express.Router();

router.use(authentication);
router.get('/', asyncHandler(CartController.getUserCart));
router.post('/', asyncHandler(CartController.addToCart));
router.post('/quantity', asyncHandler(CartController.updateQuantityProduct));
router.delete('/', asyncHandler(CartController.deleteProductInCart));

module.exports = router;