'use strict';

const { Types } = require("mongoose");
const commentModel = require("../comment.model");
const { NotFoundError, BadRequestError } = require("../../core/error-response");

const createComment = async ({productId, userId, content, parentId = null}) => {
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

    return await commentModel.create({
        comment_productId: productId,
        comment_userId: userId,
        comment_content: content,
        comment_parentId: parentId,
        comment_left: right,
        comment_right: right + 1
    });
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

    return comments;
}

module.exports = {
    createComment,
    getCommentByParentId,
}