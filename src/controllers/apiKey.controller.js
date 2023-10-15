'use strict';

const { OkResponse } = require("../core/success-response");
const ApiKeyService = require("../services/apiKey.service");

class ApiKeyController {
    static getApiKey = async (req, res, next) => {
        new OkResponse({
            message: "Get api key successfully",
            metadata: await ApiKeyService.getApiKey(req.params.permission)
        }).send(res);
    }
}

module.exports = ApiKeyController;