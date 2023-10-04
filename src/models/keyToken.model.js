const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'key';
const COLLECTION_NAME = 'keys';
var keyTokenSchema = new mongoose.Schema({
    user:{
        type: mongoose.Types.ObjectId,
        required:true,
        ref:'Shop'
    },
    privateKey: {
        type: String,
        required:true,
    },
    publicKey:{
        type:String,
        required:true,
    },
    refreshTokenUsed:{
        type:Array,
        default: []
    },
    refreshToken: {
        type:String,
        required:true,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);