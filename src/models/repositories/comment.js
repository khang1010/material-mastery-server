'use strict';

const { Types } = require("mongoose");
const commentModel = require("../comment.model");
const { NotFoundError, BadRequestError } = require("../../core/error-response");
const { getProductById } = require("./product");
const { updateProductRating } = require("../../services/product.service");
const { findUserById } = require("./user");
const { user } = require("../user.model");

const createComment = async ({productId, userId, content, parentId = null, rating = 1}) => {
    let right;
    if (parentId) {
        const foundParent = await commentModel.findById(parentId);
        if (!foundParent) throw new NotFoundError("Parent comment not found");

        right = foundParent.comment_right;

        await commentModel.updateMany({
            comment_productId: new Types.ObjectId(productId),
            comment_right: {$gte: right}
        }, {$inc: {comment_right: 2}});

        await commentModel.updateMany({
            comment_productId: new Types.ObjectId(productId),
            comment_left: {$gt: right}
        }, {$inc: {comment_left: 2}});
    } else {
        const maxRight = await commentModel.findOne({
            comment_productId: new Types.ObjectId(productId)
        }, 'comment_right', {sort: {comment_right: -1}})
        if (maxRight) {
            right = maxRight.comment_right + 1
        } else {
            right = 1
        }
    }
    const foundUser = await findUserById(userId);

    const newComment = await commentModel.create({
        comment_productId: productId,
        comment_userId: userId,
        comment_content: content,
        comment_parentId: parentId,
        comment_left: right,
        comment_right: right + 1,
        comment_userName: foundUser.display_name,
        comment_rating: rating,
    });
    if (!newComment) throw new BadRequestError("Comment not created");
    try {
        await updateProductRating(productId);
    } catch (error) {
        throw new BadRequestError(error);
    }
    return newComment;
}

const getCommentByParentId = async ({
    productId,
    parentId = null,
    limit = 50,
    offset = 0
}) => {
    if (!parentId) {
        const comments = await commentModel.find({
            comment_productId: new Types.ObjectId(productId),
        }).sort({
            comment_left: 1
        }).lean();
        
        for (const comment of comments) {
            const foundUser = await findUserById(comment.comment_userId);
            comment.user_avatar = foundUser.avatar;
        }
        
        return comments;
    };
    const parent = await commentModel.findById(parentId);
    if (!parent) throw new NotFoundError("Parent not found");
    const comments = await commentModel.find({
        comment_productId: new Types.ObjectId(productId),
        comment_right: {$lt: parent.comment_right},
        comment_left: {$gt: parent.comment_left}
    }).sort({
        comment_left: 1
    }).lean();
    for (const comment of comments) {
        const foundUser = await findUserById(comment.comment_userId);
        comment.user_avatar = foundUser.avatar;
    }
    // console.log(">>>comments: ", comments)
    return comments;
}

const deleteComments = async ({productId, commentId}, userId) => {
    const foundProduct = await getProductById(productId, []);
    if (!foundProduct) throw new NotFoundError("Product not found");
    const foundComment = await commentModel.findById(commentId);
    if (!foundComment) throw new NotFoundError("Comment not found");
    if (foundComment.comment_userId != userId) throw new BadRequestError("You can't delete this comment");

    const left = foundComment.comment_left;
    const right = foundComment.comment_right;
    // Tính width
    const width = right - left + 1;
    // Xóa tất cả comment và comment con
    await commentModel.deleteMany({
        comment_productId: new Types.ObjectId(productId),
        comment_left: {$gte: left, $lte: right}
    })
    // Cập nhật right và left cho các comment còn lại
    await commentModel.updateMany({
        comment_productId: new Types.ObjectId(productId),
        comment_right: {$gt: right}
    }, {
        $inc: {comment_right: -width}
    })
    await commentModel.updateMany({
        comment_productId: new Types.ObjectId(productId),
        comment_left: {$gt: right}
    }, {
        $inc: {comment_left: -width}
    })
    try {
        await updateProductRating(productId);
    } catch (error) {
        throw new BadRequestError(error);
    }
    return true;
}

module.exports = {
    createComment,
    getCommentByParentId,
    deleteComments
}