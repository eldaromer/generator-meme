module.exports = function (app) {
    var AuthLogic = require('./Auth.logic.js')(app);

    var decodeToken = function (req, res, next) {
        var token = req.headers.token;

        if (token) {
            AuthLogic.getBodyFromToken(token, function (err, body) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(400);
                }

                req.user = body.user;

                req.roles = [req.user.role];

                return next();
            });
        } else {
            req.user = null;
            return next();
        }
    };

    return {
        decodeToken: decodeToken
    }
};