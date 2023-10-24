const mongoose = require('mongoose'); // Erase if already required
const slugify = require('slugify');

const DOCUMENT_NAME = 'product';
const COLLECTION_NAME = 'products';
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_description: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_brand: {
        type: String,
        required: true
    },
    product_unit: {
        type: String,
        required: true
    },
    product_slug: String,
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"],
        set: (v) => Math.round(v * 10) / 10
    },
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false
    },
    product_categories: {
        type: Array,
        require: true,
        default: [],
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

productSchema.index({product_name: "text", product_description: "text"});

productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, {lower: true});
    next();
})

//Export the model
module.exports = {
    product: mongoose.model(DOCUMENT_NAME, productSchema),
};