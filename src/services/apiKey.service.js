'use strict';

const { getApiKey } = require("../models/repositories/apiKey");

class ApiKeyService {
    static getApiKey = async (permission) => {
        return await getApiKey(permission);
    }
}

module.exports = ApiKeyService