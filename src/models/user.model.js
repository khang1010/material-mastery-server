'use strict';

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'user'
const COLLECTION_NAME = 'users' 

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    avatar: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: null,
    },
    display_name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    isBlocked: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    },
    roles: {
        type: Array,
        default: [],
    },
    user_attributes: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

var customerSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        default: ''
    },
    isVip: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'customers'
});

var staffSchema = new mongoose.Schema({
    positionId: {
        type: String,
        required: true,
        default: ''
    },
    staff_start_date: {
        type: Date,
        require: true,
    },
    salary: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    collection: 'staffs'
});

var managerSchema = new mongoose.Schema({
    positionId: {
        type: String,
        required: true,
        default: ''
    },
    manager_start_date: {
        type: Date,
        require: true,
    },
    salary: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    collection: 'managers'
});

//Export the model
module.exports = {
    user: mongoose.model(DOCUMENT_NAME, userSchema),
    customer: mongoose.model('customer', customerSchema),
    staff: mongoose.model('staff', staffSchema),
    manager: mongoose.model('manager', managerSchema)
};