'use strict';
const mongoose = require('mongoose');
const { db: {host, name, port}} = require('../configs/config-mongodb');

const connectionString = `mongodb://${host}:${port}/${name}`;

// Singleton connect database
class Database {
  constructor() {
    this.connect();
  }

  // connect to the database function
  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    } // debug for dev

    mongoose
      .connect(connectionString)
      .then((_) => console.log('Connected to MongoDB'))
      .catch((error) => console.log('Failed to connect to MongoDB'));
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const  instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;
