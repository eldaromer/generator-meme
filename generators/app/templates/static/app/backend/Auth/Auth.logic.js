module.exports = function (app) {
    var jwt = app.get('jwt');
    var config = app.get('config');
    var bcrypt = app.get('bcrypt');

    var SECRET = config.secret;

    var generateTokenForJWTBody = function (body, callback) {
        return jwt.sign(body, SECRET, {}, callback);
    };

    var generateTokenForUser = function (user, callback) {
        return generateTokenForJWTBody({user: user}, callback);
    };

    var decodeToken = jwt.verify;

    var getBodyFromToken = function (token, callback) {
        if (!token) return callback({message: 'Token with body is required.'});

        return decodeToken(token, SECRET, function (err, decoded) {
            if (err) {
                    return callback(err);
            }

            return callback(null, decoded);
        });
    };

    var saltRounds = 7;
    var hashPassword = function (password, callback) {
        bcrypt.hash(password, saltRounds, callback);
    };

    var checkPassword = function (password, hash, callback) {
        if (!password || !hash) return callback({code: 500, message: 'Password and hash are required.'});
        return bcrypt.compare(password, hash, function(err, res) {
            if (err) {
                err.code = 500;
                return callback(err);
            }
            return callback(null, res);
        });
    };

    return {
        generateTokenForUser: generateTokenForUser,
        getBodyFromToken: getBodyFromToken,
        hashPassword: hashPassword,
        checkPassword: checkPassword
    };
};