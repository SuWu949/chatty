const env = process.env.NODE_ENV || 'development'; // 'dev' or 'test'
console.log('env: ' + env );

const development = {
    app: {
        port: parseInt(process.env.DEV_APP_PORT) || 3000
    }, 
    auth: { 
        jwtSecret: process.env.DEV_JWT_SECRET
    }
};

const test = {
    app: {
        port: parseInt(process.env.TEST_APP_PORT) || 3000
    }
};

const config = {
    development,
    test
};

module.exports = config[env];