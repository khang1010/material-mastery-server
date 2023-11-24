'use strict';
const mongoose = require('mongoose');
const DOCUMENT_NAME = 'comment'
const COLLECTION_NAME = 'comments' 

// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema({
    comment_productId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product'},
    comment_userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
    comment_content: {type: String, default: 'text'},
    comment_left: {type: Number, default: 0},
    comment_right: {type: Number, default: 0},
    comment_parentId: {type: mongoose.Schema.Types.ObjectId, ref: 'comment', default: null},
    comment_userName: {type: String, default: ''},
    comment_rating: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"],
    },

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, commentSchema);