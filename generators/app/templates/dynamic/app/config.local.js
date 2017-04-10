var DEV = true;
module.exports = {
    crossOrigin: DEV ? true : false,
    port: 5000,
    appDirectory: DEV ? 'app/frontend' : 'app/frontend_dist',
    baseURL: DEV ? 'http://localhost:5000' : '',
    databaseAddress: 'mongodb://localhost/<%= appName %>',
    secret: 'MuchSecureVeryAuth'
};