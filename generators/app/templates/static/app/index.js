var express = require('express');

var app = express();
app.set('router', express.Router);

var appRequire = function (name, requireName) {
    var dep = require(requireName || name);
    app.set(name, dep);
    return dep;
};

appRequire('morgan');
appRequire('mongoose');
appRequire('extend');
appRequire('jwt', 'jsonwebtoken');
appRequire('bcrypt');
appRequire('async');

var bodyParser = appRequire('body-parser');
var config = appRequire('config', './config.local');
var morgan;
morgan = require('morgan');

app.use(morgan('dev'));
app.use(bodyParser.json({
    limit: '10mb'
}));
app.use(bodyParser.urlencoded({
    extended: false
}));
if (config.crossOrigin) {
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    })
}

app.use(express.static(config.appDirectory));

require('./backend/index')(app, function (err, router) {
    app.use('/api', router);

    app.listen(config.port);
    console.info('Running on port ' + config.port);
});