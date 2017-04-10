/*global angular*/
angular.module('app')
    .factory('AuthInterceptor', ['Token', function (Token) {
        return {
            request: function (config) {
                config.headers.token = Token.getToken();
                return config;
            }
        }
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }]);