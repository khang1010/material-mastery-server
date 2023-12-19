'use strict';
const mongoose = require('mongoose');

const {
  db: { host, name, port, password },
} = require('../configs/config-mongodb');

const username = encodeURIComponent(host);
const pass = encodeURIComponent(password);
const connectionString = `mongodb+srv://${username}:${pass}@cluster0.2ujc3tr.mongodb.net/${name}?retryWrites=true&w=majority`;

// Singleton connect database
class Database {
  constructor() {
    this.connect();
  }

  // connect to the database function
  async connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    } // debug for dev

    await mongoose
      .connect(connectionString)
      .then((_) => console.log(`Connected to MongoDB with host: ${host}`))
      .catch((error) =>
        console.log(`Failed to connect to MongoDB with error: ${error}`)
      );

    // Add Socket.IO logic for broadcasting changes
    // const httpServer = http.createServer();
    // const io = new Server(httpServer);

    // io.on('connection', (socket) => {
    //   console.log('A user connected');
    // });

    // const notificationChangeStream = mongoose.connection.collection('notifications').watch();
    // notificationChangeStream.on('change', (change) => {
    //   if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
    //     console.log(">>>change: ", change.fullDocument);
    //     io.emit('notificationChange', change.fullDocument);
    //   }
    // });

    // this.io = io;
    // this.httpServer = httpServer;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;
