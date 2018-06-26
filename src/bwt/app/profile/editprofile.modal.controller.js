(function() {
    'use strict';

    angular.module('bwt.app.profile')
        .controller('EditProfileModalController', EditProfileModalController);

    function EditProfileModalController($scope, $uibModalInstance, trainer) {
        $scope.trainer = trainer;

        $scope.selectedProfilePhoto = {};

        $scope.profileSelect = function(input) {
            $scope.trainer.$newphoto = {
                file: input.files[0],
                metadata: {
                    contentType: input.files[0].type
                }
            };
        };


        $scope.profileDelete = function() {
            $scope.trainer.$deletePhoto = true;
        };

        $scope.save = function() {
            if($scope.editForm.$valid)
                $uibModalInstance.close($scope.trainer);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };
    }

})();
