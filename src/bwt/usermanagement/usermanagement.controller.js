(function() {
    'use strict';

    angular.module('bwt.usermanagement')
        .controller('UserManagementController', userManagementController);

    function userManagementController($scope, $state, $q, $location, model, logger) {
        var auth = firebase.auth();
        var actionCode = $location.search().oobCode;
        $scope.mode = $location.search().mode;
        $scope.requestResetPassword = false;
        $scope.resetPassword = false;
        $scope.recoverEmail = false;
        $scope.disabled = false;
        $scope.password = "";

        switch($scope.mode) {
            case 'resetPassword':
                // Display reset password handler and UI.
                handleResetPassword(actionCode);
                break;
            case 'recoverEmail':
                // Display email recovery handler and UI.
                handleRecoverEmail(actionCode);
                break;
            case 'verifyEmail':
                // Display email verification handler and UI.
                handleVerifyEmail(actionCode);
                break;
            default:
                $scope.requestResetPassword = true;
        }

        function checkCodeProvided() {
            if(_.isUndefined(actionCode)) {
                displayError("No code was provided, please try again!", true);
                return false;
            } else {
                return true;
            }
        }

        function handleResetPassword(actionCode) {
            if(!checkCodeProvided())
                return;

            $scope.resetPassword = true;
            // Verify the password reset code is valid.

            try {
                $q.when(auth.verifyPasswordResetCode(actionCode))
                    .then(function(email) {
                        $scope.email = email;
                    })
                    .catch(alertError);
            } catch(error) {
                displayError(error);
            }
        }

        $scope.completeResetPassword = function() {
            // Save the new password.
            try {
                return $q.when(auth.confirmPasswordReset(actionCode, $scope.password))
                    .then(function(resp) {
                        // Password reset has been confirmed and new password updated. Login and goto Dashboard.
                        logger.logSuccess('Password reset successfully');
                        return model.trainer.login($scope.email, $scope.password);
                    })
                    .catch(displayError);
            } catch(error) {
                displayError(error);
            }
        };

        function handleRecoverEmail(actionCode) {
            if(!checkCodeProvided())
                return;

            $scope.recoverEmail = true;
            // Confirm the action code is valid.
            $q.when(auth.checkActionCode(actionCode))
                .then(function(info) {
                    // Get the restored email address.
                    /*jshint sub: true */
                    $scope.email = info['data']['email'];

                    // Revert to the old email.
                    return $q.when(auth.applyActionCode(actionCode));
                })
                .catch(alertError);
        }

        $scope.sendPasswordReset = function() {
            // You might also want to give the user the option to reset their password
            // in case the account was compromised:
            $q.when(auth.sendPasswordResetEmail($scope.email))
                .then(function() {
                    logger.logSuccess('Password reset confirmation sent. Check your email.');
                })
                .catch(displayError);
        };

        function handleVerifyEmail(actionCode) {
            if(!checkCodeProvided())
                return;

            // Try to apply the email verification code.
            $q.when(auth.applyActionCode(actionCode))
                .then(function(resp) {
                    // Email address has been verified.
                    logger.logSuccess('Email Verified');
                    $state.go('login');
                })
                .catch(displayError);
        }

        function alertError(error) {
            displayError(error, true);
        }

        function displayError(error, noAlert) {
            var msg = "";
            if(_.has(error, "message")) {
                msg = error.message;
            } else if(_.has(error, "message")) {
                switch(error.code) {
                    case "auth/invalid-email":
                        msg = "The specified email is not a valid email.";
                        break;
                    default:
                        msg = "Error has occurred, please try again.";
                }
            } else if(!_.isUndefined(error)) {
                msg = error;
            } else {
                msg = "An error has occurred, please try again!";
            }

            if(noAlert) {
                $scope.errorMsg = msg;
                $scope.disabled = true;
            } else {
                logger.logError(msg);
            }
        }
    }

})();
