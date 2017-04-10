module.exports = function (app) {
    var config = app.get('config');
    var mongoose = app.get('mongoose');

    var conn = mongoose.createConnection(config.databaseAddress);

    return {
        mongoose: mongoose,
        conn: conn
    }
};