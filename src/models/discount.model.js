'use strict';
const mongoose = require('mongoose');

const DOCUMENT_NAME = 'discount'
const COLLECTION_NAME = 'discounts'

// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema({
    discount_name: { type: String, required: true },
    discount_description: { type: String, default: '' },
    discount_code: { type: String, required: true },
    discount_value: { type: Number, required: true },
    discount_max_uses: { type: Number, required: true },
    discount_max_uses_per_user: { type: Number, required: true },
    discount_user_used: { type: Array, default: [] },
    discount_type: { type: String, default: "fixed_amount" },
    discount_start_date: { type: Date, default: Date.now },
    discount_end_date: { type: Date, required: true },
    discount_uses_count: { type: Number, default: 0 },
    discount_min_order_value: { type: Number, default: 0 },
    discount_is_active: { type: Boolean, default: true },
    discount_apply_to: { type: String, required: true, enum: ["all", "specific"] },
    discount_products: { type: Array, default: [] },

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);