'use strict';
const mongoose = require('mongoose');
const DOCUMENT_NAME = 'company';
const COLLECTION_NAME = 'companies';

// Declare the Schema of the Mongo model
var companySchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true },
    company_description: { type: String, default: '' },
    company_email: { type: String, required: true, default: '' },
    company_address: {
      type: String,
      required: true,
      default: '',
    },
    company_phone: {
      type: String,
      required: false,
      default: '',
    },
    company_address: {
      type: String,
      required: false,
      default: '',
    },
    company_tax_code: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, companySchema);
