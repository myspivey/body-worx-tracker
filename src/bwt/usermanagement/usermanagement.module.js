(function() {
   'use strict';

   var module = angular.module('bwt.usermanagement', []);

   module.config(appConfig);

   function appConfig($stateProvider) {
      $stateProvider
        .state('usermanagement', {
           controller: 'UserManagementController',
           url: '/usermanagement',
           templateUrl: 'bwt/usermanagement/usermanagement.template.html',
            resolve: {
                //Wait to load login until we have our Auth state
                loggedInTrainer: ["model", function(model) {
                    return model.requireNotSignedIn();
                }]
            }
        });
   }
})();
