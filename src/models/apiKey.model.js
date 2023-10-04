'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'apiKey'
const COLLECTION_NAME = 'apiKeys' 

// Declare the Schema of the Mongo model
var apiKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    permissions: {
        type: [String],
        required: true,
        enum: ['000', '111', '222']

    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);