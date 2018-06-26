(function() {
    'use strict';

    angular.module('bwt.app.clients', [])
        .config(clientsConfig);

    function clientsConfig($stateProvider) {
        $stateProvider
            .state('app.clients', {
                controller: 'ClientsController',
                url: '/clients',
                templateUrl: 'bwt/app/clients/clients.template.html',
                resolve: {
                    clients: ["loggedInTrainer", "model", function(loggedInTrainer, model) {
                        return model.client.getClientsByTrainerId(loggedInTrainer.$id).$loaded();
                    }]
                }
            });
    }
})();








