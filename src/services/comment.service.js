'use strict';

const { createComment, getCommentByParentId } = require("../models/repositories/comment");

class CommentService {
    static createComment = async (payload) => {
        return await createComment(payload);
    }

    static getComment = async (payload) => {
        return await getCommentByParentId(payload);
    }
}

module.exports = CommentService;