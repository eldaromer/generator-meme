/*global angular*/
angular.module('app')
    .constant('API_BASE', '/api/')
    .factory('API', ['$q', '$resource', 'API_BASE', function ($q, $resource, API_BASE) {
        var API = {};

        API.Post = $resource(API_BASE + 'posts/:post_id', {
            post_id: '@_id'
        }, {
            create: {
                method: 'POST',
                url: API_BASE + 'posts/create'
            }
        });

        API.User = $resource(API_BASE + 'users/:user_id', {
            user_id: '@_id'
        }, {
            signup: {
                method: 'POST',
                url: API_BASE + 'users/signup'
            }
        });

        return API;
    }]);