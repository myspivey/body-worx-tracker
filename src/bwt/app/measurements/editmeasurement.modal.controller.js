(function() {
    'use strict';

    angular.module('bwt.app.measurements')
        .controller('EditMeasurementModalController', EditMeasurementModalController);

    function EditMeasurementModalController($scope, $uibModalInstance, measurement) {
        $scope.measurement = measurement;
        $scope.newMeasurement = false;

        if(measurement.hasOwnProperty("$id")) {
            //EDIT
            $scope.title = "Edit Measurement";
        } else {
            //ADD
            $scope.title = "New Measurement";
            $scope.newMeasurement = true;
        }

        $scope.save = function() {
            if($scope.editForm.$valid)
                $uibModalInstance.close($scope.measurement);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

})();
