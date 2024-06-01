class Logger {
  constructor() {
    this.loggerList = []
  }
  addLogger(concreteLogger) {
    this.loggerList.push(concreteLogger)
  }
  log(message, params) {
    this.loggerList.forEach((concreteLogger) => {
      concreteLogger.log(message, params)
    })
  }
  error(message, params) {
    this.loggerList.forEach((concreteLogger) => {
      concreteLogger.error(message, params)
    })
  }
}

const logger = new Logger()
logger.addLogger(require('./discord.logger'))
logger.addLogger(require('./winston.logger'))

module.exports = logger
