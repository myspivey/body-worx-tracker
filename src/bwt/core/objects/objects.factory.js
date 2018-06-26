(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('objects', objectsFactory);

    function objectsFactory() {

        var factory = {
            Trainer: Trainer,
            Client: Client,
            Presence: Presence,
            EditStamp: EditStamp,
            BodyWeightMeasurement: BodyWeightMeasurement,
            BodyCompositionMeasurement: BodyCompositionMeasurement,
            BodyComposition: BodyComposition,
            Photo: Photo
        };

        return factory;

        /////////

        function Trainer(createdById) {
            this.created = new EditStamp(createdById);
            this.modified = new EditStamp(createdById);
            this.email = '';
            this.active = true;
            this.firstName = '';
            this.lastName = '';
            this.roles = {
                admin: false
            };
            this.clients = {};
            this.photo = new Photo();
        }

        function Client(createdById) {
            this.created = new EditStamp(createdById);
            this.modified = new EditStamp(createdById);
            this.email = '';
            this.active = true;
            this.firstName = '';
            this.lastName = '';
            this.sex = 'Male';
            this.birthday = new Date();
            this.trainers = {};
            this.photo = new Photo();
        }

        function Presence() {
            this.lastSeen = firebase.database.ServerValue.TIMESTAMP;
            this.lastEstablished = firebase.database.ServerValue.TIMESTAMP;
            this.connections = [];
            this.entryUrl = '';
            this.metadata = {};
        }

        function EditStamp(id) {
            this.user = id;
            this.timestamp = firebase.database.ServerValue.TIMESTAMP;
        }

        function BodyWeightMeasurement(createdById, clientId) {
            this.created = new EditStamp(createdById);
            this.weight = 0;
            this.clientId = clientId;
        }

        function BodyCompositionMeasurement(createdById, clientId) {
            this.created = new EditStamp(createdById);
            this.modified = new EditStamp(createdById);
            this.age = 0;
            this.triceps = 0;
            this.pectoral = 0;
            this.midaxilla = 0;
            this.subscapula = 0;
            this.abdomen = 0;
            this.suprailiac = 0;
            this.quadriceps = 0;
            this.comments = '';
            this.weightId = '';
            this.clientId = clientId;
            this.$weight = new BodyWeightMeasurement(createdById, clientId);
        }

        function BodyComposition(createdById, clientId) {
            this.created = new EditStamp(createdById);
            this.modified = new EditStamp(createdById);
            this.percentFat = 0;
            this.fatWeight = 0;
            this.leanWeight = 0;
            this.finalScore = 0;
            this.rating = '';
            this.measurementId = '';
            this.clientId = clientId;
        }

        function Photo() {
            this.reference = '';
            this.url = 'images/genericUser.jpg';
            this.timestamp = firebase.database.ServerValue.TIMESTAMP;
        }
    }

})();
