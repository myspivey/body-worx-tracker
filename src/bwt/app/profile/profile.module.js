(function() {
    'use strict';

    angular.module('bwt.app.profile', [])
        .config(profileConfig);

    function profileConfig($stateProvider) {
        $stateProvider
            .state('app.profile', {
                controller: 'ProfileController',
                url: '/profile',
                templateUrl: 'bwt/app/profile/profile.template.html',
                resolve: {
                    clients: ["loggedInTrainer", "model", function(loggedInTrainer, model) {
                        return model.client.getClientsByTrainerId(loggedInTrainer.$id).$loaded();
                    }],
                    bodyCompositionMeasurements: ["loggedInTrainer", "model", function(loggedInTrainer, model) {
                        return model.bodyComposition.getBodyCompositionMeasurementsByTrainerId(loggedInTrainer.$id).$loaded();
                    }]
                }
            });
    }
})();








