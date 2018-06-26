(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('firebaseDatabase', firebaseDatabaseFactory);

    function firebaseDatabaseFactory() {
        var root = firebase.database().ref();
        var pathVerbs = {
            trainers: "trainers",
            clients: "clients",
            weight: "weight",
            bodyCompositionMeasurements: "bcm",
            bodyComposition: "bc",
            stats: "stats",
            errors: "errors",
            presence: "presence"
        };

        var factory = {
            pathVerbs: pathVerbs,
            root: root,
            trainers: root.child(pathVerbs.trainers),
            clients: root.child(pathVerbs.clients),
            stats: root.child(pathVerbs.stats),
            errors: root.child(pathVerbs.errors),
            presence: root.child(pathVerbs.presence),
            weight: root.child(pathVerbs.weight),
            bodyCompositionMeasurements: root.child(pathVerbs.bodyCompositionMeasurements),
            bodyComposition: root.child(pathVerbs.bodyComposition),
            infoConnected: root.child('.info/connected'),
            trainerById: trainerById,
            clientById: clientById,
            clientsByTrainerId: clientsByTrainerId,
            bodyCompositionMeasurementsByTrainerId: bodyCompositionMeasurementsByTrainerId,
            bodyWeightMeasurementsByClientId: bodyWeightMeasurementsByClientId,
            bodyCompositionMeasurementsByClientId: bodyCompositionMeasurementsByClientId,
            bodyCompositionByClientId: bodyCompositionByClientId,
            trainerPresenceByTrainerId: trainerPresenceByTrainerId,
            trainerPresenceByTrainerIdAndPresenceId: trainerPresenceByTrainerIdAndPresenceId
        };

        return factory;

        //PATH LOOKUP FUNCTIONS

        function trainerById(id) {
            return factory.trainers.child(id);
        }

        function clientById(id) {
            return factory.clients.child(id);
        }

        function clientsByTrainerId(id) {
            return factory.clients.orderByChild(pathVerbs.trainers + "/" + id).equalTo(true);
        }

        function bodyCompositionMeasurementsByTrainerId(id) {
            return factory.bodyCompositionMeasurements.orderByChild("created/user").equalTo(id);
        }

        function bodyWeightMeasurementsByClientId(id) {
            return factory.weight.orderByChild("clientId").equalTo(id);
        }

        function bodyCompositionMeasurementsByClientId(id) {
            return factory.bodyCompositionMeasurements.orderByChild("clientId").equalTo(id);
        }

        function bodyCompositionByClientId(id) {
            return factory.bodyComposition.orderByChild("clientId").equalTo(id);
        }

        function trainerPresenceByTrainerId(id) {
            return factory.trainers.child(id).child(pathVerbs.presence);
        }

        function trainerPresenceByTrainerIdAndPresenceId(trainerId, id) {
            return factory.trainers.child(trainerId).child(pathVerbs.presence).child("connections").child(id);
        }
    }
})();
