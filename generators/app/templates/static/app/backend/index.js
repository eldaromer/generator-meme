module.exports = function (app, callback) {
    //Get Router
    var router = app.get('router')();

    //Get Mongo Provider
    var mongo = require('./Providers/mongo')(app);
    app.set('mongo', mongo);

    //Get Models.js file
    var models = require('./models')(app);
    app.set('models', models);

    //Get Auth Logic
    var AuthLogic = require('./Auth/Auth.logic')(app);
    app.set('AuthLogic', AuthLogic);

    //Get endpoint Template
    var endpoint = require('./endpoint')(app);
    app.set('endpoint', endpoint);

    //Create Models
    //Auto-Configured Models - DO NOT TOUCH
    //End Models
    //models.createModel(require(Path From File Here)(app));

    //Set Middleware
    router.use(require('./Auth/Auth.middleware')(app).decodeToken);

    //Set Routes
    //Auto-Configured Routes - DO NOT TOUCH
    //End Routes
    router.use('/auth', require('./Auth/Auth.route.js')(app));



    return callback(null, router);
};