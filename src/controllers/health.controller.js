'use strict';
const { OkResponse } = require('../core/success-response');

class HealthController {
  static checkHealth = async (req, res, next) => {
    new OkResponse({
      message: 'Healthy!',
    }).send(res);
  };
}

module.exports = HealthController;
