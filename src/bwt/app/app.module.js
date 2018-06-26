(function() {
    'use strict';

    angular.module('bwt.app', [
        'bwt.app.profile',
        'bwt.app.dashboard',
        'bwt.app.trainers',
        'bwt.app.clients',
        'bwt.app.measurements'
    ])
        .config(appConfig);

    function appConfig($stateProvider) {
        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    //App will not load until $requireSignin resolves.
                    //If user not logged in, will eject to login.
                    loggedInTrainer: ["model", function(model) {
                        return model.requireSignIn();
                    }]
                }
            });
    }

})();








