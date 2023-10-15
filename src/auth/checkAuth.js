'use strict';

const asyncHandler = require("../helpers/asyncHandler");
const { findByKey } = require("../models/repositories/apiKey");
const JWT = require('jsonwebtoken');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
};

const checkApiKeyV0 = async (req, res, next) => {
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

const checkApiKeyV1 = async (req, res, next) => {
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
        if (!objKey.permissions.includes('111') || !objKey.permissions.includes('222'))
            return res.status(403).json({
                message: "Forbidden Error"
            })
        req.objKey = objKey
        return next();
    } catch (error) {
        
    } 
}

const checkApiKeyV2 = async (req, res, next) => {
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
        if (!objKey.permissions.includes('222'))
            return res.status(403).json({
                message: "Forbidden Error"
            })
        req.objKey = objKey
        return next();
    } catch (error) {
        
    } 
}

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID];
    
})

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

const verifyJWT = async (token, publicKey) => {
    const decoded = await JWT.verify(token, publicKey);
    return decoded
}

module.exports = {
    checkApiKeyV0,
    checkApiKeyV1,
    checkApiKeyV2,
    permission,
    verifyJWT,
}