(function() {
    'use strict';

    angular.module('bwt.app.trainers')
        .controller('EditTrainerModalController', EditTrainerModalController);

    function EditTrainerModalController($scope, $uibModalInstance, trainer) {
        $scope.trainer = trainer;
        $scope.newTrainer = false;

        if(trainer.hasOwnProperty("$id")) {
            //EDIT
            $scope.title = "Edit: " + trainer.firstName + " " + trainer.lastName;
        } else {
            //ADD
            $scope.title = "Add New Trainer";
            $scope.newTrainer = true;
            trainer.$password = generateTempPassword();
        }

        $scope.trainerPhotoSelect = function(input) {
            $scope.trainer.$newphoto = {
                file: input.files[0],
                metadata: {
                    contentType: input.files[0].type
                }
            };
        };

        $scope.photoDelete = function() {
            $scope.trainer.$deletePhoto = true;
        };

        $scope.save = function() {
            if($scope.editForm.$valid)
                $uibModalInstance.close($scope.trainer);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };


        function generateTempPassword() {
            var passwordLength = 15;
            var lowerCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var upperCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            var finalCharacters = lowerCharacters;
            finalCharacters = finalCharacters.concat(upperCharacters);
            finalCharacters = finalCharacters.concat(numbers);

            var passwordArray = [];
            for(var i = 1; i < passwordLength; i++) {
                passwordArray.push(finalCharacters[Math.floor(Math.random() * finalCharacters.length)]);
            }

            return passwordArray.join("");
        }
    }

})();
