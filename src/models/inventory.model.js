'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'inventory'
const COLLECTION_NAME = 'inventories' 

// Declare the Schema of the Mongo model
var inventorySchema = new mongoose.Schema({
    inventory_productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    inventory_location: { type: String, default: 'unknown' },
    inventory_stock: { type: Number, required: true },
    inventory_reservations: { type: Array, default: [] }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, inventorySchema);