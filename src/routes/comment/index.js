const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/checkAuth');
const CommentController = require('../../controllers/comment.controller');
const router = express.Router();

router.post('/product', asyncHandler(CommentController.getComment));
router.use(authentication);
router.post('/', asyncHandler(CommentController.createComment));
router.delete('/', asyncHandler(CommentController.deleteComment));

module.exports = router;