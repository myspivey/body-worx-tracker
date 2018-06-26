(function() {
    'use strict';

    angular.module('bwt.login')
        .controller('LoginController', loginController);

    function loginController($scope, logger) {
        $scope.loggingIn = false;
        $scope.login = function() {
            $scope.loggingIn = true;
            $scope.model.trainer.login($scope.email, $scope.password)
                .then(function() {
                    $scope.loggingIn = false;
                })
                .catch(function(error) {
                    logger.logError(error.message);
                    $scope.loggingIn = false;
                });
        };
    }

})();



