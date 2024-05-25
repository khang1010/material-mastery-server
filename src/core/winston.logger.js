const winston = require('winston')
require('winston-daily-rotate-file')

class WinstonLogger {
  static getInstance() {
    if (!this.instance) {
      this.instance = new WinstonLogger()
    }
    return this.instance
  }

  constructor() {
    const format = winston.format.printf(
      ({ message, context, requestId, timestamp, metadata, level }) => {
        return `${level}::${requestId}::${context}::${message}::${timestamp}::${JSON.stringify(metadata)}`
      },
    )

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format,
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: 'logs/info',
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-hh',
          zippedArchive: true,
          maxSize: '10m',
          maxFiles: '15d',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format,
          ),
        }),
        new winston.transports.DailyRotateFile({
          dirname: 'logs/error',
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD-hh',
          zippedArchive: true,
          maxSIze: '10m',
          maxFiles: '15d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format,
          ),
        }),
        new winston.transports.Console({ level: 'info' }),
      ],
    })
  }

  log(message, params) {
    const paramsCombine = { message, ...params }
    this.logger.info(paramsCombine)
  }
  error(message, params) {
    const paramsCombine = { message, ...params }
    this.logger.error(paramsCombine)
  }
}

module.exports = WinstonLogger.getInstance()
