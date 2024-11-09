'use strict';
const mongoose = require('mongoose');
const DOCUMENT_NAME = 'delivery';
const COLLECTION_NAME = 'deliveries';

// Declare the Schema of the Mongo model
var deliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    orderIds: { type: Array, required: true, default: [] },
    routes: { type: Array, required: false, default: null },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'cancelled', 'completed', 'draft'],
      default: 'draft',
    },
    startLocation: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, deliverySchema);
