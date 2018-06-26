(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('firebaseStorage', firebaseStorageFactory);

    function firebaseStorageFactory() {
        var root = firebase.storage().ref();

        var verbs = {
            trainerPhotos: "trainer_photos",
            clientPhotos: "client_photos"
        };

        var factory = {
            verbs: verbs,
            root: root,
            photoByRef: photoByRef
        };

        return factory;

        //PATH LOOKUP FUNCTIONS

        function photoByRef(ref) {
            return factory.root.child(ref);
        }
    }
})();
