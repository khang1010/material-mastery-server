'use strict';
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const CategoryController = require('../../controllers/category.controller');
const router = express.Router();

router.get('/', asyncHandler(CategoryController.getAll));
router.post('/', asyncHandler(CategoryController.create));
router.delete('/:category_id', asyncHandler(CategoryController.delete));

module.exports = router;