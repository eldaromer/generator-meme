/*global angular*/
angular.module('app')
    .factory('Toast', function () {
        return toastr;
    })
    .config(function () {
        toastr.options = {
            closeButton: false,
            debug: false,
            progressBar: false,
            preventDuplicates: false,
            positionClass: 'toast-top-right',
            onclick: null,
            showDuration: 500,
            hideDuration: 500,
            timeOut: 1000,
            extendedTimeOut: 10000,
            showEasing: 'swing',
            hideEasing: 'linear',
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut'
        }
    });