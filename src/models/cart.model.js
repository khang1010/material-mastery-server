'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'cart'
const COLLECTION_NAME = 'carts' 

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    cart_userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'pending', 'failed', 'completed'],
        default: 'active',
    },
    cart_count_products: {
        type: Number,
        default: 0,
    },
    cart_products: {
        type: Array,
        require: true,
        default: [],
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, cartSchema);