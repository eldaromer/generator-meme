/*global angular*/
angular.module('app')
    .factory('Auth', ['$http', 'Token', 'jwtHelper', '$timeout', '$rootScope', 'API', 'API_BASE',
            function ($http, Token, jwtHelper, $timeout, $rootScope, API, API_BASE) {
        var Auth = {};

        Auth.logout = function (cb) {
            Token.removeToken();

            Auth._sendAuthEvent();

            return cb();
        };

        Auth.getTokenPayload = function () {
            var token = Token.getToken();
            if (!token) return null;
            return jwtHelper.decodeToken(token);
        };

        Auth._sendAuthEvent = function () {
            var payload = Auth.getTokenPayload();
            if (payload && payload.user) {
                $timeout(function () {
                    API.User.get({user_id: payload.user_id}, function(user) {
                        $rootScope.$broadcast('Authentication', {
                            user: user
                        });
                    }, Error.handle);
                }, 1);
            } else {
                $rootScope.$broadcast('Authentication', {
                    user: null
                });
            }
        };

        Auth.auth = function (credentials) {
            Token.removeToken();


            return $http.post(API_BASE + 'auth', credentials).then(function(res) {
                var data = res.data;

                Token.setToken(data);
                Auth._sendAuthEvent();
            });
        };

        return Auth;
    }]);