const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode')
const winstonLogger = require('./winston.logger.js')

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {},
  }) {
    this.message = message
    this.statusCode = statusCode
    this.reasonStatusCode = reasonStatusCode
    this.metadata = metadata
  }

  send(res, headers = {}) {
    console.log('oke')
    winstonLogger.log(`response::${this.message}`, {
      context: req.path,
      requestId: req.requestId,
      metadata: this.metadata,
    })
    return res.status(this.statusCode).json(this)
  }
}

class OkResponse extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata })
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata })
  }
}

module.exports = {
  OkResponse,
  CreatedResponse,
}
