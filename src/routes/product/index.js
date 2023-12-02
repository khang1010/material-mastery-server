const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const ProductController = require('../../controllers/product.controller');
const { authentication, permission } = require('../../auth/checkAuth');
const router = express.Router();

router.get('/', asyncHandler(ProductController.getAll));
router.get('/:id', asyncHandler(ProductController.getProductById));
router.get('/category/:id', asyncHandler(ProductController.getProductByCategoryId));

router.use(authentication);
router.use(permission('staff'));
router.get('/publish/:id', asyncHandler(ProductController.publishProduct));
router.get('/unpublish/:id', asyncHandler(ProductController.unPublishProduct));
router.post('/', asyncHandler(ProductController.create));
router.patch('/:id', asyncHandler(ProductController.update));
router.delete('/:id', asyncHandler(ProductController.deleteById));

module.exports = router;