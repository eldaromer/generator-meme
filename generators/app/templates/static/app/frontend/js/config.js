/*global angular*/
angular.module('app')
    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider
        //Auto-Configured Routes - DO NOT TOUCH
        //End Routes
            .otherwise({redirectTo: "/"});

    }]);