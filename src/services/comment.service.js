'use strict';

const { createComment, getCommentByParentId, deleteComments } = require("../models/repositories/comment");

class CommentService {
    static createComment = async (payload) => {
        return await createComment(payload);
    }

    static getComment = async (payload) => {
        return await getCommentByParentId(payload);
    }

    static deleteComment = async (payload, userId) => {
        return await deleteComments(payload, userId);
    }
}

module.exports = CommentService;