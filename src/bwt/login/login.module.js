(function() {
    'use strict';

    angular.module('bwt.login', [])
        .config(loginConfig);

    function loginConfig($stateProvider) {
        $stateProvider
            .state('login', {
                controller: 'LoginController',
                url: '/login',
                templateUrl: 'bwt/login/login.template.html',
                resolve: {
                    //Wait to load login until we have our Auth state
                    loggedInTrainer: ["model", function(model) {
                        return model.requireNotSignedIn();
                    }]
                }
            });
    }

})();








