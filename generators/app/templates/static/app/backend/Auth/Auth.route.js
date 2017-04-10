module.exports = function (app) {
    var User = app.get('models').User;
    var router = app.get('router')();

    var AuthLogic  = app.get('AuthLogic');

    router.post('/', function(req, res) {
        if (!(req.body.password && req.body.username)) return res.status(400).send({message: 'Username and password are required to sign in.'});
        var q = User.findOne({
            username: req.body.username.toLowerCase()
        });

        q.exec(function (error, user) {
            if (error) {
                console.error(error);
                return res.sendStatus(500);
            }
            if (!user) {
                console.info('User not found.');
                return res.status(403).send({message: 'The email and password you entered don\'t match our records.'})
            }
            AuthLogic.checkPassword(req.body.password, user.passwordHash, function (err, valid) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                }

                if (valid) {
                    AuthLogic.generateTokenForUser(user, function(user, token) {
                        if (err) {
                            console.error(err);
                            return res.sendStatus(500);
                        }
                        return res.send(token);
                    });
                } else {
                    return res.sendStatus(403).send({message: 'The email and password you entered don\'t match our records.'})
                }
            });
        });
    });

    return router;
};