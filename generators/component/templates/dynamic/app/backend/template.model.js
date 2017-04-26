module.exports = function (app) {
    var mongoose = app.get('mongoose');
    var Schema = mongoose.schema;

    return {
        name: '<%= compName %>',
        schema: {

        },
        populates: []
    }
};