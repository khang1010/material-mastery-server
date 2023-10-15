'use strict';

const apiKeyModel = require("../apiKey.model");
const crypto = require("crypto");

const createApiKey = async (permission) => {
    const objKey = await apiKeyModel.create({
        key: crypto.randomBytes(64).toString("hex"),
        permissions: [permission],
    });
    return objKey.key;
}

const getApiKey = async (permission) => {
    const apiKey = await apiKeyModel.findOne({permissions: permission}).lean();
    if (!apiKey) {
        return await createApiKey(permission);
    }
    return apiKey.key;
}

const findByKey = async (key) => {
    const objKey = await apiKeyModel.findOne({key: key, status: true}).lean();
    return objKey;
}

module.exports = {
    findByKey,
    createApiKey,
    getApiKey,
}