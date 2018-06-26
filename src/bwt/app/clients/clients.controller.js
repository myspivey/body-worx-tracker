(function() {
    'use strict';

    angular.module('bwt.app.clients')
        .controller('ClientsController', clientsController);

    function clientsController($scope, $filter, $uibModal, objects, logger, clients) {
        $scope.clients = clients;
        $scope.searchKeywords = '';
        $scope.filteredClients = [];
        $scope.row = '';
        $scope.numPerPageOpt = [3, 5, 10, 20];
        $scope.numPerPage = $scope.numPerPageOpt[2];
        $scope.currentPage = 1;
        $scope.currentPageClients = [];

        $scope.clients.$watch(initView);

        $scope.selectPage = function(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.currentPageClients = $scope.filteredClients.slice(start, end);
        };

        $scope.onFilterChange = function() {
            $scope.selectPage(1);
            $scope.currentPage = 1;
            return $scope.row = '';
        };

        $scope.onNumPerPageChange = function() {
            $scope.selectPage(1);
            return $scope.currentPage = 1;
        };

        $scope.onOrderChange = function() {
            $scope.selectPage(1);
            return $scope.currentPage = 1;
        };

        $scope.search = function() {
            $scope.filteredClients = $filter('filter')($scope.clients, $scope.searchKeywords);
            return $scope.onFilterChange();
        };

        $scope.order = function(rowName) {
            if($scope.row === rowName) {
                return;
            }
            $scope.row = rowName;
            $scope.filteredClients = $filter('orderBy')($scope.clients, rowName);
            return $scope.onOrderChange();
        };

        $scope.addClient = function() {
            var loggedInTrainerId = $scope.model.loggedInTrainerId();
            var newClient = new objects.Client(loggedInTrainerId);
            newClient.trainers[loggedInTrainerId] = true;
            openModal(newClient);
        };

        $scope.editClient = function(client) {
            openModal(angular.copy(client));
        };

        function initView() {
            $scope.row = '';
            $scope.order('$lastNameFirstName');
        }

        initView();

        function openModal(client) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'bwt/app/clients/editclient.modal.template.html',
                controller: 'EditClientModalController',
                size: 'md',
                resolve: {
                    client: function() {
                        return client;
                    }
                }
            });

            modalInstance.result.then(saveClient);
        }

        function saveClient(client) {
            $scope.model.client.saveClient($scope.model.loggedInTrainerId(), client)
                .then(displaySuccess).catch(displayError);
        }

        function displaySuccess() {
            logger.logSuccess("Save Successful!");
        }

        function displayError(error) {
            logger.logError(error.message);
        }
    }

})();
