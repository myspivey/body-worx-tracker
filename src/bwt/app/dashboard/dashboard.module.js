(function() {
    'use strict';

    angular.module('bwt.app.dashboard', ['ngecharts'])
        .config(dashboardConfig);

    function dashboardConfig($stateProvider) {
        $stateProvider
            .state('app.dashboard', {
                controller: 'DashboardController',
                url: '/dashboard',
                templateUrl: 'bwt/app/dashboard/dashboard.template.html'
            });
    }
})();








