'use strict';
const mongoose = require('mongoose');
const DOCUMENT_NAME = 'pheromone';
const COLLECTION_NAME = 'pheromones';

// Declare the Schema of the Mongo model
var pheromoneSchema = new mongoose.Schema(
  {
    fromLocation: { type: String, required: true }, // Địa điểm xuất phát
    toLocation: { type: String, required: true }, // Địa điểm đích
    pheromone: { type: Number, default: 1 }, // Giá trị pheromone
    heuristic: { type: Number, default: 1 }, // Giá trị heuristic (khoảng cách hoặc trọng số)
    distance: { type: Number }, // Khoảng cách giữa các địa điểm
    evaporationRate: { type: Number, default: 0.05 }, // Tốc độ bay hơi của pheromone
    rating: { type: Number, default: 0 }, // Đánh giá của shipper (0 - 5 sao)
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, pheromoneSchema);
