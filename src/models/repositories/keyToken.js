'use strict';
const JWT = require('jsonwebtoken');
const keyTokenModel = require('../keyToken.model');
const { BadRequestError } = require('../../core/error-response');

const createOrUpdateKeyToken = async (userId, publicKey, privateKey, refreshToken) => {
    const publicKeyString = publicKey.toString('hex');
    const privateKeyString = privateKey.toString('hex');

    const filter = { user: userId };
    const update = {
        privateKey: privateKeyString,
        publicKey: publicKeyString,
        refreshToken,
    }
    const newToken = keyTokenModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
    })
    if (!newToken) throw new BadRequestError("Key token error");
    return (await newToken).publicKey;
}

const findKeyToken = async (filter) => {
    return await keyTokenModel.findOne(filter).lean();
}

const removeByIdToken = async (id) => {
    return await keyTokenModel.findByIdAndDelete(id);
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '3 days'
        });
        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        });

        // JWT.verify(accessToken, publicKey, (err, decode) => {
        //     if (err) {
        //         console.log(`error verify ${err}`)
        //     } else {
        //         console.log(`decode verify ${decode}`);
        //     }
        // });

        return {accessToken, refreshToken}
    } catch (error) {
        return {
            message: "create token pair failed",
            error: error.message
        }        
    }
}

module.exports = {
    createTokenPair,
    createOrUpdateKeyToken,
    findKeyToken,
    removeByIdToken,
}