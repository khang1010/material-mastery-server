'use strict';

const asyncHandler = require("../helpers/asyncHandler");
const { findByKey } = require("../models/repositories/apiKey");
const JWT = require('jsonwebtoken');
const { findKeyToken } = require("../models/repositories/keyToken");
const { AuthenticationError, NotFoundError, BadRequestError } = require("../core/error-response");

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
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new NotFoundError("User not found")

    const keyStore = await findKeyToken({user: userId});
    if (!keyStore) throw new NotFoundError("Key not found")
    // console.log(">>>Key store: ", keyStore)

    if (req.headers[HEADER.REFRESHTOKEN]) {
        const refreshToken = req.headers[HEADER.REFRESHTOKEN];
        try {
            const decodeUser = JWT.verify(refreshToken, keyStore.publicKey);
            if (userId !== decodeUser.userId) throw new AuthenticationError("Invalid User")
            req.keyStore = keyStore
            req.refreshToken = refreshToken
            req.user = decodeUser
            return next()
        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    // console.log("AccessToken: ", accessToken)
    if (!accessToken) throw new AuthenticationError("Invalid Token")

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) throw new AuthenticationError("Invalid User")
        req.keyStore = keyStore
        req.user = decodeUser
        // console.log(">>>Decode user: ", decodeUser)
        return next()
    } catch (error) {
        throw new BadRequestError(error)
    }

})

const permission = (permission) => {
    return (req, res, next) => {
        if (req.user.roles.includes("manager")) return next();
        if (req.user.roles.includes("staff") && permission !== "manager") return next();
        if (!req.user.roles.includes(permission)) {
            return res.status(403).json({
                message: "Permission denied"
            })
        }
        return next();
    }
}

const checkManagerPermission = async (req, res, next) => {
    if (req.user.roles.includes('manager')) {
        return next();
    }
    return res.status(403).json({
        message: "Permission denied"
    })
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
    authentication,
    verifyJWT,
    checkManagerPermission,
}