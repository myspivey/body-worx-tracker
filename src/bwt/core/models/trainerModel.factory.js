(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('trainerModel', trainerModelFactory);

    function trainerModelFactory($q, $firebaseUtils, $firebaseObject, firebaseDatabase, firebaseStorage, TrainersList, Auth, objects, presenceModel, FIREBASE_CONFIG) {
        var loadedData = {};

        var factory = {
            loggedIn: false,
            loggedInTrainer: null,
            login: login,
            logout: logout,
            getTrainers: getTrainers,
            getTrainerById: getTrainerById,
            addTrainer: addTrainer,
            saveTrainer: saveTrainer,
            saveLoggedInTrainer: saveLoggedInTrainer,
            resetTrainerPassword: resetTrainerPassword,
            destroy: destroy
        };

        return factory;

        ////////////

        function login(email, password) {
            //UI State change and model update is handled in app.run
            return Auth.$signInWithEmailAndPassword(email, password);
        }

        function logout() {
            //UI State change and model update is handled in app.run
            return presenceModel
                .removeLatestPresenceByTrainerId(factory.loggedInTrainer.$id)
                .then(Auth.$signOut);
        }

        function getTrainers() {
            if(checkPropertyNeedsLoading(loadedData.trainers)) {
                loadedData.trainers = new TrainersList(firebaseDatabase.trainers);
            }
            return loadedData.trainers;
        }

        function getTrainerById(id) {
            if(checkPropertyNeedsLoading(loadedData[id])) {
                loadedData[id] = $firebaseObject(firebaseDatabase.trainerById(id));
            }
            return loadedData[id];
        }

        function addTrainer(trainer) {
            //Hackey work around to be able to create users without being signed in as them
            //http://stackoverflow.com/questions/37517208/firebase-kicks-out-current-user/38013551#38013551
            var newUser;
            var tempApp = firebase.initializeApp(FIREBASE_CONFIG, "createUserTempApp");

            try {
                return $q.when(tempApp.auth()
                    .createUserWithEmailAndPassword(trainer.email, trainer.$password))
                    .then(function(ref) {
                        newUser = ref;
                        tempApp.delete();
                        tempApp = null;

                        //We have to avoid AngularFire as to save this way we would have to pull down the entire user list.
                        //This allows us to simply push the user with our own key. We dont need syncing here.
                        return $q.when(firebaseDatabase.trainers.child(newUser.uid).set($firebaseUtils.toJSON(trainer)));
                    })
                    .then(function() {
                        return $q.when(newUser.uid);
                    });
            }
            catch(error) {
                if(!_.isNull(tempApp))
                    tempApp.delete();
                return $q.reject(error);
            }
        }

        function saveTrainer(trainer) {
            return deleteUploadTrainerPhoto(trainer)
                .then(function() {
                    var call;
                    if(trainer.hasOwnProperty("$id")) {
                        trainer.modified = new objects.EditStamp(factory.loggedInTrainer.$id);
                        var rec = getTrainers().$getRecord(trainer.$id);
                        call = getTrainers().$save(angular.merge(rec, trainer));
                    } else {
                        call = addTrainer(trainer);
                    }
                    return call;
                });
        }

        function saveLoggedInTrainer(trainer) {
            return deleteUploadTrainerPhoto(trainer)
                .then(setLoggedInTrainer);
        }

        function resetTrainerPassword(trainer) {
            return Auth.$sendPasswordResetEmail(trainer.email);
        }

        function destroy() {
            _.forIn(loadedData, function(value, key) {
                value.$destroy();
            });
            loadedData = {};
            factory.loggedIn = false;
            factory.loggedInTrainer = null;
        }

        //UTIL FUNCTIONS

        function setLoggedInTrainer(trainer) {
            var promises = {};
            var id = trainer.$id;
            var password = trainer.$password;
            var trainerCopy = $firebaseUtils.toJSON(trainer);

            trainerCopy.modified = new objects.EditStamp(id);

            if(!_.isNil(password) && password.length > 7) {
                promises.updatePassword = Auth.$updatePassword(password);
            }
            if(!_.eq(trainerCopy.email, trainer.$firebaseUser.email)) {
                promises.updateEmail = Auth.$updateEmail(trainerCopy.email);
            }

            promises.saveUser = $q.when(firebaseDatabase.trainerById(id).set(trainerCopy));
            return $q.all(promises);
        }

        function deleteUploadTrainerPhoto(trainer) {
            return uploadTrainerPhoto(trainer)
                .then(deleteTrainerPhoto)
        }

        function uploadTrainerPhoto(trainer) {
            if(trainer.hasOwnProperty("$newphoto")) {
                var refPath = firebaseStorage.verbs.trainerPhotos + "/" + trainer.$id + "." + trainer.$newphoto.file.name.split('.').pop();
                return firebaseStorage.photoByRef(refPath)
                    .put(trainer.$newphoto.file, trainer.$newphoto.metadata)
                    .then(function(snapshot) {
                        delete trainer.$newphoto;
                        var photo = new objects.Photo();
                        photo.reference = refPath;
                        photo.url = snapshot.metadata.downloadURLs[0];
                        trainer.photo = photo;
                        return $q.resolve(trainer);
                    });
            } else
                return $q.resolve(trainer);
        }

        function deleteTrainerPhoto(trainer) {
            if(trainer.hasOwnProperty("$deletePhoto")) {
                return firebaseStorage.photoByRef(trainer.photo.reference)
                    .delete()
                    .then(function() {
                        delete trainer.$deletePhoto;
                        trainer.photo = new objects.Photo();
                        return $q.resolve(trainer);
                    });
            } else
                return $q.resolve(trainer);
        }

        function checkPropertyNeedsLoading(property) {
            return (_.isNil(property) || (!_.isNil(property) && property.$isDestroyed));
        }
    }

})();
