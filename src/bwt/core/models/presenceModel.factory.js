(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('presenceModel', presenceModelFactory);

    function presenceModelFactory($window, $http, $firebaseObject, firebaseDatabase, CONSTANTS) {

        var loadedData = {};

        var factory = {
            latestPresence: "",
            setTrainerPresenceByTrainerId: setTrainerPresenceByTrainerId,
            getTrainerPresenceByTrainerId: getTrainerPresenceByTrainerId,
            removeTrainerPresenceByTrainerIdAndPresenceId: removeTrainerPresenceByTrainerIdAndPresenceId,
            removeLatestPresenceByTrainerId: removeLatestPresenceByTrainerId,
            destroy: destroy
        };

        return factory;

        // METHODS

        function setTrainerPresenceByTrainerId(id) {
            commitPresenceWithIP(firebaseDatabase.trainerPresenceByTrainerId(id));
        }

        function getTrainerPresenceByTrainerId(id) {
            if(checkPropertyNeedsLoading(loadedData[id])) {
                loadedData[id] = $firebaseObject(firebaseDatabase.trainerPresenceByTrainerId(id));
            }
            return loadedData[id];
        }

        function removeTrainerPresenceByTrainerIdAndPresenceId(trainerId, presenceId) {
            return firebaseDatabase.trainerPresenceByTrainerIdAndPresenceId(trainerId, presenceId).remove();
        }

        function removeLatestPresenceByTrainerId(trainerId) {
            return removeTrainerPresenceByTrainerIdAndPresenceId(trainerId, factory.latestPresence);
        }

        function destroy() {
            _.forIn(loadedData, function(value, key) {
                value.$destroy();
            });
            loadedData = {};
        }

        // UTIL FUNCTIONS

        function commitPresence(path, connection, extraInfo) {

            //Store extra properties on connection
            connection.version = CONSTANTS.version;
            connection.buildTimestamp = CONSTANTS.timestamp;
            connection.established = firebase.database.ServerValue.TIMESTAMP;
            connection.entryUrl = $window.location.href;

            var infoConnected = firebaseDatabase.infoConnected;
            infoConnected.on('value', function(snap) {
                if(snap.val() === true) {
                    path.child("lastSeen").onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
                    path.child("lastEstablished").set(firebase.database.ServerValue.TIMESTAMP);

                    var newConnection = path.child("connections").push(connection);
                    newConnection.onDisconnect().remove();
                    factory.latestPresence = newConnection.key;

                    if(!_.isNil(extraInfo)) {
                        _.forEach(extraInfo, function(value, key) {
                            path.child("metadata").child(key).set(value);
                        });
                    }
                }
            });
        }

        function commitPresenceWithIP(path, extraInfo) {
            $http.get('https://ipinfo.io/json', {cache: true})
                .then(function(result) {
                    commitPresence(path, result.data, extraInfo);
                }, function(error) {
                    commitPresence(path, {error: "Could Not Get IP Info"}, extraInfo);
                    throw(new Error(error));
                });
        }

        function checkPropertyNeedsLoading(property) {
            return (_.isNil(property) || (!_.isNil(property) && property.$isDestroyed));
        }
    }
})();
