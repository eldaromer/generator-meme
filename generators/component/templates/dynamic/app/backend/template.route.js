module.exports = function (app) {
    var router = app.get('router')();

    var endpoint = app.get('endpoint');

    var models = app.get('models');
    var Model = models.User;
    var Post = models.Post;

    var async = app.get('async');

    //Add routes here

    return router;
};