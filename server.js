const app = require('./src/app');
const {port} = require('./src/configs/config-mongodb');
const socketService = require('./src/services/socket.service');

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
global._io = io;
global._io.on('connection', socketService.connection);