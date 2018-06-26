(function() {
    'use strict';

    angular.module('bwt.app.clients')
        .controller('EditClientModalController', EditClientModalController);

    function EditClientModalController($scope, $uibModalInstance, client) {
        $scope.client = client;
        $scope.newClient = false;
        $scope.dateOptions = {
            showWeeks: false,
            maxDate: new Date()
        };

        $scope.birthdayPopup = {
            opened: false
        };

        if(client.hasOwnProperty("$id")) {
            //EDIT
            $scope.title = "Edit: " + client.firstName + " " + client.lastName;
        } else {
            //ADD
            $scope.title = "Add New Client";
            $scope.newClient = true;
        }

        $scope.clientPhotoSelect = function(input) {
            $scope.client.$newphoto = {
                file: input.files[0],
                metadata: {
                    contentType: input.files[0].type
                }
            };
        };

        $scope.photoDelete = function() {
            $scope.client.$deletePhoto = true;
        };

        $scope.save = function() {
            if($scope.editForm.$valid)
                $uibModalInstance.close($scope.client);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };

        $scope.openBirthdayPopup = function() {
            $scope.birthdayPopup.opened = true;
        };
    }

})();
