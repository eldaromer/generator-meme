/**
 * Credit to Jake Billings for endpoint.js
 *
 * http://github.com/jake-billings
 *
 * http://jakebillings.com
 *
 * @param app
 * @returns {{}}
 */
module.exports = function (app) {
    var endpoint = {};

    var _ = app.get('underscore');

    var AuthLogic = app.get('AuthLogic');

    var noop = function (o, callback) {
        return callback(null, o);
    };

    endpoint.auth = function (isValid) {
        return function (req,res,next) {
            if (isValid(req)) {
                return next();
            }
            return res.sendStatus(403);
        };
    };

    endpoint.asyncAuth = function (isValid) {
        return function (req,res,next) {
            return isValid(req,function (err, valid) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(err.status||500);
                }
                if (valid) return next();
                return res.sendStatus(403);
            });
        };
    };

    endpoint.loggedIn = function () {
        return function (req,res,next) {
            if (req.user) {
                return next();
            }
            return res.sendStatus(403);
        };
    };

    endpoint.hasRole = function (roles) {
        if (!Array.isArray(roles)) roles = [roles];

        return function (req,res,next) {
            if (req.user&&(_.intersection(req.roles,roles).length>0)) {
                return next();
            }
            return res.sendStatus(403);
        };
    };

    endpoint.tokenUserIdMatchesParamId = function () {
        return function (req, res, next) {
            console.log(req.params);
            if (req.user._id===req.params._id) return next();
            return res.sendStatus(403);
        };
    };

    endpoint.tokenCustomerIdMatchesParamId = function () {
        return function (req, res, next) {
            if (req.user.customer===req.params._id) return next();
            return res.sendStatus(403);
        };
    };

    endpoint.read = function (Model, populates, queryMiddleware, middleware) {
        if (!middleware) middleware = noop;

        return function (req, res) {
            var query = undefined;
            if (req.params.id) {
                query = {_id: req.params.id};
            }
            var q = Model.find(query);

            var populate = !req.query.populate || req.query.populate === true || req.query.populate == 'true';
            if (populate && populates) {
                if (!Array.isArray(populates)) populates = [populates];
                populates.forEach(function (p) {
                    q.populate(p);
                });
            }

            if (queryMiddleware) {
                queryMiddleware(q);
            }

            q.exec(function (err, result) {
                middleware(result, function (err, items) {
                    if (err) {
                        console.error(err);

                        if (err.status&&err.message) {
                            return res.status(err.status).send({
                                status: err.status,
                                message: err.message
                            });
                        }

                        return res.sendStatus(500);
                    }

                    if (!items) {
                        return res.sendStatus(404);
                    }

                    if (req.params.id) {
                        if (items.length < 1) {
                            return res.sendStatus(404);
                        } else if (items.length > 1) {
                            return res.sendStatus(500);
                        } else {
                            return res.send(items[0]);
                        }
                    }

                    return res.send(items);
                });
            });
        };
    };


    function depopulate(body, populates) {
        if (!Array.isArray(populates)) populates = [populates];
        populates.forEach(function (p) {
            var ps = body[p];
            if (ps && (Array.isArray('array'))) {
                body[p] = [];
                ps.forEach(function (item) {
                    body[p].push(item._id);
                });
            }
        });
    }

    endpoint.depopulate = depopulate;

    endpoint.create = function (Model, populates, middleware) {
        if (!middleware) middleware = noop;
        return function (req, res) {

            var d = !req.query.depopulate || req.query.depopulate === true || req.query.depopulate == 'true';
            if (d && populates) {
                depopulate(req.body, populates);
            }

            middleware(req.body, function (err, result) {
                if (err) {
                    console.error(err);

                    if (err.status&&err.message) {
                        return res.status(err.status).send({
                            status: err.status,
                            message: err.message
                        });
                    }

                    return res.sendStatus(500);
                }
                var n = new Model(result);

                n.save(function (err, result) {
                    if (err) {
                        console.error(err);
                        if (err.name==='ValidationError') return res.status(422).send({title: 'Invalid object', message: err.message});
                        if (err.code&&err.code===11000) return res.status(422).send({title: 'Duplicate object', message: 'Value already in use'});
                        return res.sendStatus(400);
                    } else {
                        return res.send(result);
                    }
                });
            });
        };
    };

    endpoint.update = function (Model, populates, middleware) {
        if (!middleware) middleware = noop;
        return function (req, res) {
            var d = !req.query.depopulate || req.query.depopulate === true || req.query.depopulate == 'true';

            if (d && populates) {
                depopulate(req.body, populates);
            }

            middleware(req.body, function (err, result) {
                if (err) {
                    console.error(err);

                    if (err.status&&err.message) {
                        return res.status(err.status).send({
                            status: err.status,
                            message: err.message
                        });
                    }

                    return res.sendStatus(500);
                }
                Model.findOneAndUpdate({
                    _id: req.params.id
                }, result, function (err, a) {
                    if (err) {
                        console.error(err);
                        if (err.name==='ValidationError') return res.status(422).send({title: 'Invalid update', message: err.message});
                        if (err.code&&err.code===11000) return res.status(422).send({title: 'Update would create duplicate', message: 'Value already in use'});
                        return res.sendStatus(400);
                    }
                    return res.send(a);
                });
            });
        };
    };

    endpoint.delete = function (Model) {
        return function (req, res) {
            Model.findOne({
                _id: req.params.id
            }, function (err, result) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(400);
                }
                if (!result) {
                    return res.sendStatus(404);
                }
                return result.remove(function (err) {
                    if (err) {
                        console.error(err);
                        return res.sendStatus(500);
                    }
                    return res.sendStatus(204);
                });
            });
        };
    };



    endpoint.readChildren = function (Model, queryBuilder, populates, queryMiddleware, middleware) {
        if (!middleware) middleware = noop;
        if (!queryMiddleware) queryMiddleware = function() {};
        if (!Array.isArray(queryBuilder)) {
            queryBuilder = [
                {
                    param: queryBuilder,
                    queryParam: queryBuilder
                }
            ];
        }

        return function (req, res) {
            var query = {};
            queryBuilder.forEach(function (property) {
                var a = req.params[property.param];
                if (a) query[property.queryParam] = a;
            });
            var q = Model.find(query);

            var populate = !req.query.populate || req.query.populate === true || req.query.populate == 'true';
            if (populate && populates) {
                if (!Array.isArray(populates)) populates = [populates];
                populates.forEach(function (p) {
                    q.populate(p);
                });
            }

            if (queryMiddleware) {
                queryMiddleware(q);
            }

            q.exec(function (err, result) {
                if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                }
                middleware(result, function (err, items) {
                    if (err) {
                        console.error(err);
                        return res.sendStatus(500);
                    }

                    if (req.params._id) {
                        if (items.length < 1) return res.status(404).send({message: 'No items found.'});
                        if (items.length < 2) return res.send(items[0]);
                        return res.sendStatus(500);
                    }

                    return res.send(items);
                });
            });
        };
    };

    endpoint.orderByField = function (field, reverse) {
        return function (q) {
            var sort = {};
            sort[field] = reverse;
            q.sort(sort);
        };
    };

    endpoint.hashPasswordMiddleware = function (o, callback) {
        if (o.password) {
            return AuthLogic.hashPassword(o.password, function (err, passwordHash) {
                if (err) {
                    return callback(err);
                }
                o.passwordHash = passwordHash;
                o.password = undefined;

                return callback(null, o);
            });
        }
        callback(null, o);
    };

    var scrubUser = function (o) {
        if (o.passwordHash) o.passwordHash = undefined;
        o.enabled = (o.username !== 'admin');
        return o;
    };

    endpoint.userOutputMiddleware = function (o, callback) {
        if (!o) return callback(null, o);
        if (Array.isArray(o)) {
            callback(null, o.map(scrubUser));
        } else {
            callback(null, scrubUser(o));
        }
    };

    return endpoint;
};