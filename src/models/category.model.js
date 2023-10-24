'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'category'
const COLLECTION_NAME = 'categories' 

// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        require: true,
    },
    category_description: {
        type: String,
        default: '',
    },
    parent_category: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'category',
        require: true
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, categorySchema);