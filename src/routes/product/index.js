const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const ProductController = require('../../controllers/product.controller');
const { authentication, permission } = require('../../auth/checkAuth');
const router = express.Router();

router.get('/', asyncHandler(ProductController.getAll));

router.use(authentication);
router.use(permission('staff'));
router.post('/', asyncHandler(ProductController.create));
router.patch('/:id', asyncHandler(ProductController.update));
router.delete('/:id', asyncHandler(ProductController.deleteById));

module.exports = router;