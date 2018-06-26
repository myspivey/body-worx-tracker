(function() {
    'use strict';

    angular.module('bwt.app.trainers')
        .controller('TrainersController', trainersController);

    function trainersController($scope, $filter, $uibModal, objects, logger, trainers) {
        $scope.trainers = trainers;
        $scope.searchKeywords = '';
        $scope.filteredTrainers = [];
        $scope.row = '';
        $scope.numPerPageOpt = [3, 5, 10, 20];
        $scope.numPerPage = $scope.numPerPageOpt[2];
        $scope.currentPage = 1;
        $scope.currentPageTrainers = [];

        $scope.trainers.$watch(initView);

        $scope.selectPage = function(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.currentPageTrainers = $scope.filteredTrainers.slice(start, end);
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
            $scope.filteredTrainers = $filter('filter')($scope.trainers, $scope.searchKeywords);
            return $scope.onFilterChange();
        };

        $scope.order = function(rowName) {
            if($scope.row === rowName) {
                return;
            }
            $scope.row = rowName;
            $scope.filteredTrainers = $filter('orderBy')($scope.trainers, rowName);
            return $scope.onOrderChange();
        };

        $scope.addTrainer = function() {
            var loggedInTrainerId = $scope.model.loggedInTrainerId();
            var newTrainer = new objects.Trainer(loggedInTrainerId);
            openModal(newTrainer);
        };

        $scope.editTrainer = function(trainer) {
            openModal(angular.copy(trainer));
        };

        $scope.resetTrainerPassword = function(event, trainer) {
            event.stopImmediatePropagation();
            $scope.model.trainer.resetTrainerPassword(trainer)
                .then(logger.logSuccess('Reset Email Sent!'))
                .catch(displayError);
        };

        $scope.getOnline = function(trainer) {
            var presence = trainer.presence;
            return (!_.isNil(presence) && !_.isNil(presence.connections));
        };
        $scope.getLastOnline = function(trainer) {
            var presence = trainer.presence;
            return (!_.isNil(presence) && _.isNil(presence.connections) && !_.isNil(presence.lastOnline)) ? '(Last Online ' + moment(presence.lastOnline).calendar() + ')' : "";
        };

        function initView(event) {
            $scope.row = '';
            $scope.order('$lastNameFirstName');
        }

        initView();

        function openModal(trainer) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'bwt/app/trainers/edittrainer.modal.template.html',
                controller: 'EditTrainerModalController',
                size: 'md',
                resolve: {
                    trainer: function() {
                        return trainer;
                    }
                }
            });

            modalInstance.result.then(saveTrainer);
        }

        function saveTrainer(trainer) {
            $scope.model.trainer.saveTrainer(trainer)
                .then(displaySuccess)
                .catch(displayError);
        }

        function displaySuccess() {
            logger.logSuccess("Save Successful!");
        }

        function displayError(error) {
            console.log(error);
            logger.logError(error.message);
        }
    }

})();
