const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const instanceMongoDb = require('./dbs/init-mongodb');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./utils/swagger');
const redisClient = require('./dbs/init-redis');
const cors = require('cors');
require('dotenv').config();
require('./helpers/billCleanup');
const app = express();

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// init middleware
app.use(morgan('dev')); // show details request package
app.use(helmet()); // hide some information package
app.use(compression()); // reduce memory usage package
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

// init database
instanceMongoDb;
app.use((req, res, next) => {
  req.io = instanceMongoDb.io; // Pass io instance to the request object
  next();
});

// init routes
app.use('/', require('./routes/index'));

// handle error
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    message: error.message,
    stack: error.stack,
    status: statusCode,
  });
});

module.exports = app;
