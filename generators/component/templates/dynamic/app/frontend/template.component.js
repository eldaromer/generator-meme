/*global angular*/
angular.module('app')
    .directive('<%= acronym %><%= compName %>', function () {
        return {
            templateUrl: 'components/<%= compName %>/<%= compName %>.html',
            controller: ['$scope', '$location', 'API', function ($scope, $location, API) {

            }]
        };
    });