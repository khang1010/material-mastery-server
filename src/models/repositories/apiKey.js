'use strict';

const apiKeyModel = require("../apiKey.model");

const findByKey = async (key) => {
    const objKey = await apiKeyModel.findOne({key: key, status: true});
    return objKey;
}

module.exports = {
    findByKey,
}