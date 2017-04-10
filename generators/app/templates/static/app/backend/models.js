module.exports = function (app) {
    var mongo = app.get('mongo');
    var extend = app.get('extend');

    var mongoose = mongo.mongoose;
    var conn = mongo.conn;

    var createModel = function (m) {
        var name = m.name;
        var rawSchema = m.schema;
        var config = {
            timestamps: true
        };
        extend(config, m.config);

        var schema = new mongoose.Schema(rawSchema, config);
        if (config.pre) {
            Object.keys(config.pre).forEach(function (key) {
                schema.pre(key, config.pre[key]);
            });
        }
        if (config.post) {
            Object.keys(config.post).forEach(function (key) {
                schema.post(key, config.post[key]);
            });
        }
        models[name + 'RawSchema'] = rawSchema;
        models[name + 'Schema'] = schema;
        var model = conn.model(name, schema);
        models[name] = model;

        model.populates = m.populates;

        models.all.push(model);
    };

    var models = {
        all: [],
        createModel: createModel
    };

    return models;
};