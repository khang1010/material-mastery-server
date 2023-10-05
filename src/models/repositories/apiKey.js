'use strict';

const apiKeyModel = require("../apiKey.model");
const crypto = require("crypto");

const createApiKey = async (permissions) => {
    const objKey = await apiKeyModel.create({
        key: crypto.randomBytes(64).toString("hex"),
        permissions: permissions,
    });
    return objKey.key;
}

const getApiKey = async (permissions) => {
    const apiKey = await apiKeyModel.findOne({permissions: permission}).lean();
    if (!apiKey) {
        return await createApiKey(permissions);
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