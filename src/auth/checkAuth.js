'use strict';

const { findByKey } = require("../models/repositories/apiKey");

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
};

const apiKey = async (req, res, next) => {
    try {
        // console.log('API key: ', req.headers[HEADER.API_KEY]);
        let key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: "Forbidden Error"
            })
        }
        
        const objKey = await findByKey(key);
        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden Error"
            })
        }
        req.objKey = objKey
        return next();
    } catch (error) {
        
    } 
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions.includes(permission)) {
            return res.status(403).json({
                message: "Permission denied"
            })
        }
        return next();
    }
}

module.exports = {
    apiKey,
    permission
}