(function() {
    'use strict';

    angular.module('bwt.app.measurements', [])
        .config(measurementsConfig);

    function measurementsConfig($stateProvider) {
        $stateProvider
            .state('app.measurements', {
                controller: 'MeasurementsController',
                url: '/measurements/:selectedClientId',
                reloadOnSearch: false,
                templateUrl: 'bwt/app/measurements/measurements.template.html',
                params:  {
                    selectedClientId: {
                        value: null,
                        squash: true
                    }
                },
                resolve: {
                    clients: ["loggedInTrainer", "model", function(loggedInTrainer, model) {
                        return model.client.getClientsByTrainerId(loggedInTrainer.$id).$loaded();
                    }],
                    selectedClientId: ["$stateParams", function($stateParams) {
                        return $stateParams.selectedClientId;
                    }]
                }
            });
    }
})();








