(function() {
    'use strict';

    angular.module('bwt.app.measurements')
        .controller('MeasurementsController', measurementsController);

    function measurementsController($scope, $uibModal, $filter, $state, $q, objects, logger, clients, selectedClientId) {
        var xAxisData = [];
        var weightSeries = {
            name: 'Weight',
            type: 'line',
            yAxisIndex: 0,
            clickable: false,
            showAllSymbolType: true
        };
        var fatSeries = {
            name: 'Fat Percentage',
            type: 'line',
            yAxisIndex: 1,
            clickable: false,
            showAllSymbolType: true
        };
        var graphDefaults = {
            tooltip: {
                trigger: 'axis',
                formatter: formatChartToolTip
            },
            legend: {
                data: ['Weight', 'Fat Percentage']
            },
            dataZoom: {
                show: true
            },
            toolbox: {
                show: true,
                padding: [0, 40, 5, 5],
                feature: {
                    magicType: {show: true, title: {line: "Line Graph", bar: "Bar Graph"}, type: ['line', 'bar']},
                    dataZoom: {show: true, title: {dataZoom: "Zoom Data", dataZoomReset: "Reset Data Zoom"}},
                    restore: {show: true, title: "Reset"},
                    saveAsImage: {
                        show: true,
                        title: "Save as Image",
                        lang: ["Click To Save"]
                    }
                }
            },
            xAxis: [
                {
                    type: 'category',
                    splitLine: {show: true, onGap: false, interval: 0},
                    axisLabel: {show: true, interval: 0},
                    axisTick: {show: true, onGap: false, interval: 0},
                    axisLine: {show: false}
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Weight',
                    axisLine: {lineStyle: {width: 0}}
                },
                {
                    type: 'value',
                    name: 'Fat Percentage',
                    splitLine: {show: false},
                    splitArea: {show: false},
                    axisLine: {lineStyle: {width: 0}}
                }
            ],
            series: [weightSeries, fatSeries]
        };

        $scope.clients = clients;
        $scope.searchKeywords = '';
        $scope.filteredClients = [];
        $scope.measurementGraph = {};
        $scope.measurementGraph.config = {};

        $scope.search = function() {
            $scope.filteredClients = $filter('filter')($scope.clients, $scope.searchKeywords);
        };

        $scope.selectClient = function(client) {
            $state.go('app.measurements', {selectedClientId: client.$id}, {location: 'replace', notify: false});
            $scope.selectedClient = client;

            $scope.weightMeasurements = $scope.model.bodyComposition.getBodyWeightMeasurementsByClientId(client.$id);
            $scope.compositionMeasurements = $scope.model.bodyComposition.getBodyCompositionMeasurementsByClientId(client.$id);
            $scope.composition = $scope.model.bodyComposition.getBodyCompositionByClientId(client.$id);

            $q.all([
                $scope.weightMeasurements.$loaded(),
                $scope.compositionMeasurements.$loaded(),
                $scope.composition.$loaded()
            ]).then(processMeasurements);
        };

        $scope.clearClient = function() {
            $state.go('app.measurements', {selectedClientId: null}, {location: 'replace', notify: false});
            $scope.selectedClient = null;
            $scope.bodyWeightMeasurements = $scope.compositionMeasurements = $scope.composition = [];
            $scope.latestWeightMeasurements = $scope.latestCompositionMeasurements = $scope.latestComposition = {};
            $scope.averageWeight = 0;
        };

        $scope.addMeasurement = function() {
            var newMeasurement = new objects.BodyCompositionMeasurement($scope.model.loggedInTrainerId(), $scope.selectedClient.$id);
            newMeasurement.age = moment().diff(moment($scope.selectedClient.$age));
            openModal(newMeasurement);
        };

        $scope.editMeasurement = function(measurement) {
            openModal(angular.copy(measurement));
        };

        $scope.search();

        if(!_.isNull(selectedClientId)) {
            $scope.selectClient(clients.$getRecord(selectedClientId));
        }

        function processMeasurements(results) {
            if(results && results[0].length === 0) return;

            $scope.latestWeightMeasurement = $scope.weightMeasurements[$scope.weightMeasurements.length - 1];
            $scope.latestCompositionMeasurement = $scope.compositionMeasurements[$scope.compositionMeasurements.length - 1];
            $scope.latestComposition = $scope.composition[$scope.composition.length - 1];
            $scope.measurementsCombined = [];

            var weightSum = 0;
            _.forEach($scope.weightMeasurements, function(weightMeasurement) {
                weightSum += weightMeasurement.weight;
                //console.log('hasKey',weightMeasurement.$id)
            });
            $scope.averageWeight = weightSum / $scope.weightMeasurements.length;

            xAxisData = [];
            weightSeries.data = [];
            fatSeries.data = [];

            var fatPercentageSum = 0;
            var measurementsCombined = [];
            _.forEach($scope.compositionMeasurements, function(compositionMeasurement) {
                compositionMeasurement.$weight = $scope.weightMeasurements.$getRecord(compositionMeasurement.weightId);
                compositionMeasurement.$composition = $scope.composition.$getRecord(compositionMeasurement.bcId);
                measurementsCombined.push(compositionMeasurement);

                weightSeries.data.push(compositionMeasurement.$weight.weight);
                fatSeries.data.push(compositionMeasurement.$composition.percentFat);

                fatPercentageSum += compositionMeasurement.$composition.percentFat;

                xAxisData.push(moment(compositionMeasurement.created.timestamp).format('MM-D-YY, h:mm a'));
            });
            $scope.measurementsCombined = _.reverse(measurementsCombined);
            $scope.averageFatPercentage = fatPercentageSum / $scope.compositionMeasurements.length;

            graphDefaults.xAxis[0].data = xAxisData;
            graphDefaults.toolbox.feature.saveAsImage.name = _.snakeCase($scope.selectedClient.$lastNameFirstName + " measurementGraph");
            $scope.measurementGraph.config = {};
            angular.copy(graphDefaults, $scope.measurementGraph.config);
        }

        function formatChartToolTip(params) {
            var returnString = params[0].name + "<br/>";

            _.forEach(params, function(object) {
                returnString += object.seriesName + ": " + $filter('number')(object.data, 2) + (object.seriesName == "Weight" ? "lbs" : "%" ) + "<br/>";
            });
            return returnString;
        }

        function openModal(measurement) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'bwt/app/measurements/editmeasurement.modal.template.html',
                controller: 'EditMeasurementModalController',
                size: 'sm',
                resolve: {
                    measurement: function() {
                        return measurement;
                    }
                }
            });

            modalInstance.result.then(saveMeasurement);
        }

        function saveMeasurement(measurement) {
            var call;
            if(measurement.hasOwnProperty("$id")) {
                call = $scope.model.bodyComposition.saveBodyCompositionFromMeasurements(measurement, $scope.selectedClient);
            } else {
                call = $scope.model.bodyComposition.addBodyCompositionFromMeasurements(measurement, $scope.selectedClient);
            }

            call.then(function() {
                processMeasurements();
                displaySuccess();
            }).catch(displayError);
        }

        function displaySuccess() {
            logger.logSuccess("Save Successful!");
        }

        function displayError(error) {
            logger.logError(error.message);
        }
    }

})();
