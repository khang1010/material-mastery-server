const express = require('express');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/checkAuth');
const CommentController = require('../../controllers/comment.controller');
const router = express.Router();

router.get('/', asyncHandler(CommentController.getComment));
router.use(authentication);
router.post('/', asyncHandler(CommentController.createComment));

module.exports = router;