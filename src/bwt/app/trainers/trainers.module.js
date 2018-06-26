(function() {
    'use strict';

    angular.module('bwt.app.trainers', [])
        .config(clientsConfig);

    function clientsConfig($stateProvider) {
        $stateProvider
            .state('app.trainers', {
                controller: 'TrainersController',
                url: '/trainers',
                templateUrl: 'bwt/app/trainers/trainers.template.html',
                resolve: {
                    trainers: ["model", function(model) {
                        return model.trainer.getTrainers().$loaded();
                    }]
                }
            });
    }
})();








