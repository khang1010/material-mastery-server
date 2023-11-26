'use strict';
const mongoose = require('mongoose');

const DOCUMENT_NAME = 'favoriteProduct'
const COLLECTION_NAME = 'favoriteProducts' 

// Declare the Schema of the Mongo model
var favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    count_products: {
        type: Number,
        default: 0,
    },
    products: {
        type: Array,
        require: true,
        default: [],
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, favoriteSchema);