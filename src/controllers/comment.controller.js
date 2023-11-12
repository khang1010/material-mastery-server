'use strict';

const { CreatedResponse, OkResponse } = require("../core/success-response");
const CommentService = require("../services/comment.service");

class CommentController {
    static createComment = async (req, res, next) => {
        new CreatedResponse({
            message: "Create comment successfully",
            metadata: await CommentService.createComment({userId: req.user.userId, ...req.body})
        }).send(res);
    }
    static getComment = async (req, res, next) => {
        new OkResponse({
            message: "Get comment successfully",
            metadata: await CommentService.getComment(req.body)
        }).send(res);
    }
    static deleteComment = async (req, res, next) => {
        new OkResponse({
            message: "Delete comment successfully",
            metadata: await CommentService.deleteComment(req.body, req.user.userId)
        }).send(res);
    }
}

module.exports = CommentController;