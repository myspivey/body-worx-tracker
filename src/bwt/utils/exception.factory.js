(function() {
    'use strict';

    angular
        .module('bwt.utils')
        .factory('$exceptionHandler', exceptionHandler);

    function exceptionHandler($log, $window, $injector) {
        //Overrides the builtin exceptionHandler to be able to push errors to the server.
        var localErrorStorage = "worx-tracker-errors";
        return function(exception, cause) {
            try {
                if(_.has(exception, 'code')) {
                    //We dont show service exceptions
                    console.log('exception',exception);
                    return;
                }
                var model = $injector.get('model');
                var firebaseUtils = $injector.get('$firebaseUtils');
                var firebaseDatabase = $injector.get('firebaseDatabase');
                var errors = angular.fromJson($window.localStorage.getItem(localErrorStorage)) || [];
                var errorMessage = exception.toString();
                var stackTrace = StackTrace.fromError(exception);

                stackTrace.then(function(result) {
                    var sendError = {
                        time: new Date().getTime(),
                        url: $window.location.href,
                        message: errorMessage,
                        stackTrace: result,
                        build: {
                            version: model.version,
                            timestamp: model.timestamp,
                            by: model.builtBy
                        },
                        cause: ( cause || "")
                    };

                    if(model.loggedIn) {
                        var firebaseUser = {};
                        firebaseUser.email = model.firebaseUser.email;
                        firebaseUser.uid = model.firebaseUser.uid;
                        firebaseUser.providerData = model.firebaseUser.providerData;
                        sendError.firebaseUser = firebaseUser;
                        sendError.loggedInTrainer = firebaseUtils.toJSON(model.loggedInTrainer());
                    }

                    //Set Local
                    errors.push(sendError);
                    $window.localStorage.setItem(localErrorStorage, angular.toJson(errors));

                    //Send to Server
                    firebaseDatabase.errors.push(firebaseUtils.toJSON(sendError));
                });

            } catch(loggingError) {
                $log.warn("Error server-side logging failed");
                $log.log(loggingError);
            }

            if(model.debug) {
                $log.error.apply($log, arguments);
            }
        };
    }
})();
