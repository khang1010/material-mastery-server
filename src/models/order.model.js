'use strict';
const mongoose = require('mongoose');
const DOCUMENT_NAME = 'order'
const COLLECTION_NAME = 'orders' 

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    order_userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
    order_address: {type: Object, default: {}},
    order_checkout: {type: Object, default: {}},
    order_products: {type: Array, required: true, default: []},
    order_status: {type: String, enum: ['pending', 'confirmed', 'shipping', 'shipped', 'cancelled', 'failed', 'delivered'], default: 'pending'},
    order_note: {type: String, default: ''},
    order_phone: {type: String, default: ''},
    order_date: {type: Date, default: Date.now},
    order_payment: {type: Object, default: {}},
    order_exportId: {type: String, default: ''},
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);