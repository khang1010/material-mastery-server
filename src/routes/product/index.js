const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const ProductController = require('../../controllers/product.controller');
const { authentication, permission } = require('../../auth/checkAuth');
const router = express.Router();
const upload = require('../../configs/multer.config');

router.get('/number', asyncHandler(ProductController.getNumberOfProducts));
router.get(
  '/number/:category',
  asyncHandler(ProductController.getNumberOfProductsByCategory)
);
router.get(
  '/category/:id',
  asyncHandler(ProductController.getProductByCategoryId)
);
router.get('/search', asyncHandler(ProductController.searchProductsByUser));
router.get('/selling', asyncHandler(ProductController.getSellingProducts));
router.get('/', asyncHandler(ProductController.getAll));
router.get('/:id', asyncHandler(ProductController.getProductById));

router.use(authentication);
router.use(permission('staff'));
router.get('/publish/:id', asyncHandler(ProductController.publishProduct));
router.get('/unpublish/:id', asyncHandler(ProductController.unPublishProduct));
router.post(
  '/file',
  upload.single('file'),
  asyncHandler(ProductController.createV2)
);
router.post('/', asyncHandler(ProductController.create));
router.patch('/:id', asyncHandler(ProductController.update));
router.delete('/:id', asyncHandler(ProductController.deleteById));
router.get('/all/draft', asyncHandler(ProductController.getAllDraft));

module.exports = router;
