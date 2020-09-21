/*
 * Set environment variables from .env file
 * https://www.npmjs.com/package/dotenv
 */

const env = process.env.NODE_ENV || 'development'; // 'development' or 'test', default to 'development'
console.log('env: ' + env );

const development = {
    app: {
        port: parseInt(process.env.DEV_APP_PORT) || 3000,
        reqLimit: process.env.DEV_MAX_REQ_SIZE
    }, 
    auth: { 
        jwtSecret: process.env.DEV_JWT_SECRET
    }
};

const test = {
    app: {
        port: parseInt(process.env.TEST_APP_PORT) || 3000,
        reqLimit: process.env.TEST_MAX_REQ_SIZE
    }
};

const config = {
    development,
    test
};

module.exports = config[env];