'use strict';
const mongoose = require('mongoose');

class SocketService {
    connection(socket) {
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });

        const notificationChangeStream = mongoose.connection.collection('notifications').watch();
        notificationChangeStream.on('change', (change) => {
            if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
                console.log(">>>change: ", change.fullDocument);
                _io.emit('notificationChange', change.fullDocument);
            }
        });
    }
}

module.exports = new SocketService();