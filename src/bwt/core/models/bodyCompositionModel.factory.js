(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('bodyCompositionModel', bodyCompositionModelFactory);

    function bodyCompositionModelFactory($q, $firebaseArray, firebaseDatabase, objects, trainerModel) {

        var loadedData = {};

        var factory = {
            getBodyCompositionMeasurementsByTrainerId: getBodyCompositionMeasurementsByTrainerId,
            getBodyWeightMeasurementsByClientId: getBodyWeightMeasurementsByClientId,
            getBodyCompositionMeasurementsByClientId: getBodyCompositionMeasurementsByClientId,
            getBodyCompositionByClientId: getBodyCompositionByClientId,
            addBodyWeightFromMeasurementsByClientId: addBodyWeightFromMeasurementsByClientId,
            addBodyCompositionFromMeasurements: addBodyCompositionFromMeasurements,
            saveBodyCompositionFromMeasurements: saveBodyCompositionFromMeasurements,
            destroy: destroy
        };

        return factory;

        ////////////

        function getBodyCompositionMeasurementsByTrainerId(id) {
            if(checkPropertyNeedsLoading(loadedData[id + "bcmtrainer"])) {
                loadedData[id + "bcmtrainer"] = $firebaseArray(firebaseDatabase.bodyCompositionMeasurementsByTrainerId(id));
            }
            return loadedData[id + "bcmtrainer"];
        }

        function getBodyWeightMeasurementsByClientId(id) {
            if(checkPropertyNeedsLoading(loadedData[id + "weight"])) {
                loadedData[id + "weight"] = $firebaseArray(firebaseDatabase.bodyWeightMeasurementsByClientId(id));
            }
            return loadedData[id + "weight"];
        }

        function getBodyCompositionMeasurementsByClientId(id) {
            if(checkPropertyNeedsLoading(loadedData[id + "bcm"])) {
                loadedData[id + "bcm"] = $firebaseArray(firebaseDatabase.bodyCompositionMeasurementsByClientId(id));
            }
            return loadedData[id + "bcm"];
        }

        function getBodyCompositionByClientId(id) {
            if(checkPropertyNeedsLoading(loadedData[id + "bc"])) {
                loadedData[id + "bc"] = $firebaseArray(firebaseDatabase.bodyCompositionByClientId(id));
            }
            return loadedData[id + "bc"];
        }

        function addBodyWeightFromMeasurementsByClientId(client, wm) {
            getBodyWeightMeasurementsByClientId(client.$id).$add(wm);
        }

        function addBodyCompositionFromMeasurements(bcm, client) {
            var bc = calculateBodyComposition(client, bcm);

            return getBodyWeightMeasurementsByClientId(client.$id)
                .$add(bcm.$weight)
                .then(function(result) {
                    bcm.weightId = result.key;
                    return getBodyCompositionByClientId(client.$id).$add(bc);
                }).then(function(result) {
                    bcm.bcId = result.key;
                    return getBodyCompositionMeasurementsByClientId(client.$id).$add(bcm);
                });
        }

        function saveBodyCompositionFromMeasurements(bcm, client) {
            var bc = calculateBodyComposition(client, bcm);

            var weights = getBodyWeightMeasurementsByClientId(client.$id);
            var bcms = getBodyCompositionMeasurementsByClientId(client.$id);
            var bcs = getBodyCompositionByClientId(client.$id);

            var savePromises = [];

            var editStamp = new objects.EditStamp(trainerModel.loggedInTrainer.$id);
            bcm.modified = bcm.$weight.modified = bcm.$composition.modified = editStamp;

            savePromises.push(weights.$save(angular.merge(weights.$getRecord(bcm.$weight.$id), bcm.$weight)));
            savePromises.push(bcms.$save(angular.merge(bcms.$getRecord(bcm.$id), bcm)));
            savePromises.push(bcs.$save(angular.merge(bcs.$getRecord(bcm.$composition.$id), bc)));

            return $q.all(savePromises);
        }

        function destroy() {
            _.forIn(loadedData, function(value, key) {
                value.$destroy();
            });
            loadedData = {};
        }

        //UTIL FUNCTIONS

        function calculateBodyComposition(client, bcm) {
            var wm = bcm.$weight;
            var bc = new objects.BodyComposition(bcm.created.user, bcm.clientId);
            var sum = getRoundedSumOfSites([bcm.triceps, bcm.pectoral, bcm.midaxilla, bcm.subscapula, bcm.abdomen, bcm.suprailiac, bcm.quadriceps]);
            var standardDeviation, density, populationAverage = 0;

            if(client.sex == "Male") {
                density = 1.112 - 0.00043499 * sum + 0.00000055 * Math.pow(sum, 2) - 0.00028826 * bcm.age;
                populationAverage = 13.815 + 0.13 * bcm.age;
                standardDeviation = 6;
            }
            else if(client.sex == "Female") {
                density = 1.097 - 0.00046971 * sum + 0.00000056 * Math.pow(sum, 2) - 0.00012828 * bcm.age;
                populationAverage = 21.55 + 0.1 * bcm.age;

            }
            bc.percentFat = (4.95 / density - 4.5) * 100;
            bc.fatWeight = wm.weight * bc.percentFat / 100;
            bc.leanWeight = wm.weight - bc.fatWeight;

            if(client.sex == "Female") {
                if(bc.percentFat <= populationAverage) {
                    standardDeviation = 8;
                }
                else {
                    standardDeviation = 7;
                }
            }

            var healthScore = (populationAverage - bc.percentFat) / standardDeviation;
            var pe = Math.exp(-1.8355027 * (Math.abs(healthScore) - 0.23073201));
            var percRegress = -0.41682992 * (pe - 1) / (pe + 1) + 0.58953708;

            if(healthScore > 0) {
                bc.finalScore = Math.round(percRegress * 100);
            }
            else if(healthScore <= 0) {
                bc.finalScore = Math.round((1 - percRegress) * 100);
            }

            if(healthScore >= 1) {
                bc.rating = "Excellent";
            }
            else if(healthScore < 1 && healthScore >= 0.5) {
                bc.rating = "Good";
            }
            else if(healthScore < 0.5 && healthScore >= -0.5) {
                bc.rating = "Average";
            }
            else if(healthScore < -0.5 && healthScore >= -1) {
                bc.rating = "Fair";
            }
            else if(healthScore < -1) {
                bc.rating = "Poor";
            }

            return bc;
        }

        function getRoundedSumOfSites(sites) {
            var sum = 0;
            _.forEach(sites, function(value) {
                sum += value * 1;
            });
            return sum;
        }

        function checkPropertyNeedsLoading(property) {
            return (_.isNil(property) || (!_.isNil(property) && property.$isDestroyed));
        }

    }

})();
