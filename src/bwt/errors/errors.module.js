(function() {
    'use strict';

    angular.module('bwt.errors', [])
        .config(errorConfig);

    function errorConfig($stateProvider) {
        $stateProvider
            .state('404', {
                url: '/404',
                templateUrl: 'bwt/errors/404.template.html'
            });
    }

})();








