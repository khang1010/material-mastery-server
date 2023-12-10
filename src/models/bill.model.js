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
        type: Object,
        default: {},
    },
    product_list: {
        type: Array,
        require: true,
    },
    bill_status: {
        type: String,
        require: true,
        enum: ['pending', 'confirmed', 'deleted'],
        default: 'pending',
    },
    bill_checkout: {
        type: Object,
        default: {}
    },
    bill_payment: {
        type: Object,
        default: {}
    },
    bill_address: {
        type: Object,
        default: {}
    },
    bill_image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, billSchema);