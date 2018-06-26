(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('clientModel', clientModelFactory);

    function clientModelFactory($q, $firebaseArray, $firebaseObject, firebaseDatabase, firebaseStorage, trainerModel, ClientsList, objects) {

        var loadedData = {};

        var factory = {
            getClientById: getClientById,
            getClientsByTrainerId: getClientsByTrainerId,
            addClient: addClient,
            saveClient: saveClient,
            destroy: destroy
        };

        return factory;

        ////////////

        function getClientById(id) {
            if(checkPropertyNeedsLoading(loadedData[id])) {
                loadedData[id] = $firebaseObject(firebaseDatabase.clientById(id));
            }
            return loadedData[id];
        }

        function getClientsByTrainerId(id) {
            if(checkPropertyNeedsLoading(loadedData[id])) {
                loadedData[id] = new ClientsList(firebaseDatabase.clientsByTrainerId(id));
            }
            return loadedData[id];
        }

        function addClient(client) {
            client.birthday = client.birthday.getTime();
            return $firebaseArray(firebaseDatabase.clients).$add(client)
                .then(function(ref) {
                    if(!trainerModel.loggedInTrainer.hasOwnProperty("clients"))
                        trainerModel.loggedInTrainer.clients = {};
                    trainerModel.loggedInTrainer.clients[ref.key] = true;
                    return trainerModel.loggedInTrainer.$save();
                })
        }

        function saveClient(trainerId, client) {
            return deleteClientPhoto(client)
                .then(uploadClientPhoto)
                .then(function() {
                    var call;
                    if(client.hasOwnProperty("$id")) {
                        client.modified = new objects.EditStamp(trainerModel.loggedInTrainer.$id);
                        var rec = getClientsByTrainerId(trainerId).$getRecord(client.$id);
                        call = getClientsByTrainerId(trainerId).$save(angular.merge(rec, client));
                    } else {
                        call = addClient(client);
                    }

                    return call
                })
        }

        function destroy() {
            _.forIn(loadedData, function(value, key) {
                value.$destroy();
            });
            loadedData = {};
        }

        //UTIL FUNCTIONS

        function uploadClientPhoto(client) {
            if(client.hasOwnProperty("$newphoto")) {
                var refPath = firebaseStorage.verbs.clientPhotos + "/" + client.$id + "." + client.$newphoto.file.name.split('.').pop();
                return firebaseStorage.photoByRef(refPath)
                    .put(client.$newphoto.file, client.$newphoto.metadata)
                    .then(function(snapshot) {
                        delete client.$newphoto;
                        var photo = new objects.Photo();
                        photo.reference = refPath;
                        photo.url = snapshot.metadata.downloadURLs[0];
                        client.photo = photo;
                        return $q.resolve(client);
                    });
            } else
                return $q.resolve(client);
        }

        function deleteClientPhoto(client) {
            if(client.hasOwnProperty("$deletePhoto")) {
                return firebaseStorage.photoByRef(client.photo.reference)
                    .delete()
                    .then(function() {
                        delete client.$deletePhoto;
                        client.photo = new objects.Photo();
                        return $q.resolve(client);
                    });
            } else
                return $q.resolve(client);
        }

        function checkPropertyNeedsLoading(property) {
            return (_.isNil(property) || (!_.isNil(property) && property.$isDestroyed));
        }
    }

})();
