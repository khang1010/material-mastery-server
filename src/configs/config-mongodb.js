'use strict';

const dev = {
    port: process.env.DEV_APP_PORT || 8083,
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        name: process.env.DEV_DB_NAME || 'materialDev',
        port: process.env.DEV_DB_PORT || 27017,
    }
}

const pro = {
    port: process.env.PRO_APP_PORT || 8083,
    db: {
        host: process.env.PRO_DB_HOST || 'localhost',
        name: process.env.PRO_DB_NAME || 'materialPro',
        port: process.env.PRO_DB_PORT || 27017,
    }
}
const config = {dev, pro};
const env = process.env.NODE_ENV || 'dev';

module.exports = config[env];