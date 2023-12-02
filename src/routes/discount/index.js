const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, permission } = require('../../auth/checkAuth');
const DiscountController = require('../../controllers/discount.controller');

const router = express.Router();

router.get('/', asyncHandler(DiscountController.getDiscountsOfProduct));
router.get('/products', asyncHandler(DiscountController.getProductsApplyDiscount));
router.post('/amount', asyncHandler(DiscountController.getDiscountAmount));

router.use(authentication)
router.post('/cancel', asyncHandler(DiscountController.cancelDiscountCode));
router.use(permission('staff'))
router.post('', asyncHandler(DiscountController.createDiscount));
router.patch('/:discount_id', asyncHandler(DiscountController.updateDiscount));
router.delete('/delete', asyncHandler(DiscountController.deleteDiscountCode));

module.exports = router;