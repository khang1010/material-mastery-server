'use strict';
const mongoose = require('mongoose');
const DOCUMENT_NAME = 'notification'
const COLLECTION_NAME = 'notifications' 

// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema({
    noti_type: {type: String, default: "SYSTEM"},
    noti_receivedId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user', default: null},
    noti_content: {type: String, default: 'text', required: true},
    noti_options: {type: Array, required: true, default: []}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);