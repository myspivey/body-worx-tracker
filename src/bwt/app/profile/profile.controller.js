(function() {
    'use strict';

    angular.module('bwt.app.profile')
        .controller('ProfileController', ProfileController);

    function ProfileController($scope, $uibModal, clients, bodyCompositionMeasurements, logger) {
        $scope.clients = clients;
        $scope.bodyCompositionMeasurements = bodyCompositionMeasurements;

        var avgAge = 0;
        _.forEach(clients, function(client) {
            avgAge += client.$age;
        });
        $scope.clientAverageAge = avgAge / clients.length;

        //TODO: This really all needs to live in a service on a NodeServer
        $scope.days = _.reduceRight(_.concat(clients, bodyCompositionMeasurements),
            function(accumulator, value) {
                value.$daysSince = moment(value.created.timestamp).fromNow();
                if(value.hasOwnProperty('clientId')) {
                    value.$client = clients.$getRecord(value.clientId);
                    value.$type = 'MEASURE_CLIENT';
                } else {
                    value.$type = 'NEW_CLIENT';
                }

                var cal = moment(value.created.timestamp).calendar(null, {
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    nextWeek: 'dddd',
                    lastDay: '[Yesterday]',
                    lastWeek: '[Last] dddd',
                    sameElse: 'DD/MM/YYYY'
                });

                var idx = _.findIndex(accumulator, ['label', cal]);
                if(idx === -1) {
                    var obj = {};
                    obj.label = cal;
                    obj.timestamp = value.created.timestamp;
                    obj.events = [value];
                    accumulator.push(obj);
                } else {
                    accumulator[idx].events.push(value);
                }

                return accumulator;
            }, []);

        $scope.editProfile = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'bwt/app/profile/editprofile.modal.template.html',
                controller: 'EditProfileModalController',
                size: 'md',
                resolve: {
                    trainer: function() {
                        return angular.copy($scope.model.loggedInTrainer());
                    }
                }
            });

            modalInstance.result.then(saveTrainer);
        };

        function saveTrainer(trainer) {
            $scope.model.trainer.saveLoggedInTrainer(trainer)
                .then(displaySuccess)
                .catch(displayError);
        }

        function displaySuccess() {
            logger.logSuccess("Save Successful!");
        }

        function displayError(error) {
            logger.logError(error.message);
        }
    }

})();
