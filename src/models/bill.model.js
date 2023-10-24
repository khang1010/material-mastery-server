'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'bill'
const COLLECTION_NAME = 'bills' 

// Declare the Schema of the Mongo model
var billSchema = new mongoose.Schema({
    bill_date: {
        type: Date,
        require: true,
        default: Date.now()
    },
    bill_note: {
        type: String,
        require: true,
    },
    bill_type: {
        type: String,
        require: true,
        enum: ['import', 'export'],
    },
    tax: {
        type: Number,
        require: true,
        default: 0
    },
    supplier: {
        type: String,
        default: '',
    },
    product_list: {
        type: Array,
        require: true,
    },
    total_cost: {
        type: Number,
        require: true,
        default: 0
    },
    discount: {
        type: Number,
        require: true,
        default: 0
    },
    final_cost: {
        type: Number,
        require: true,
        default: 0
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, billSchema);