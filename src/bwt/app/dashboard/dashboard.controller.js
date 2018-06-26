(function() {
    'use strict';

    angular.module('bwt.app.dashboard')
        .controller('DashboardController', DashboardController);

    function DashboardController($scope) {

        $scope.color = {
            primary: '#5B90BF',
            success: '#A3BE8C',
            info: '#7FABD2',
            infoAlt: '#B48EAD',
            warning: '#EBCB8B',
            danger: '#BF616A',
            gray: '#DCDCDC'
        };

        // info #6BBCD7 107,188,215
        // success #81CA80 129,202,128

        $scope.pie1 = {};
        $scope.pie1.options = {
            animation: true,
            title: {
                text: 'Traffic Source',
                x: 'left'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            calculable: true,
            series: [
                {
                    name: 'Vist source',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: [
                        {
                            value: 335,
                            name: 'Direct',
                            itemStyle: {
                                normal: {
                                    color: $scope.color.success,
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: $scope.color.success
                                        }
                                    },
                                    labelLine: {
                                        show: true,
                                        lineStyle: {
                                            color: $scope.color.success
                                        }
                                    }
                                }
                            }
                        }, {
                            value: 310,
                            name: 'Email',
                            itemStyle: {
                                normal: {
                                    color: $scope.color.infoAlt,
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: $scope.color.infoAlt
                                        }
                                    },
                                    labelLine: {
                                        show: true,
                                        lineStyle: {
                                            color: $scope.color.infoAlt
                                        }
                                    }
                                }
                            }
                        }, {
                            value: 135,
                            name: 'Video Ads',
                            itemStyle: {
                                normal: {
                                    color: $scope.color.warning,
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: $scope.color.warning
                                        }
                                    },
                                    labelLine: {
                                        show: true,
                                        lineStyle: {
                                            color: $scope.color.warning
                                        }
                                    }
                                }
                            }
                        }, {
                            value: 1548,
                            name: 'Search',
                            itemStyle: {
                                normal: {
                                    color: $scope.color.info,
                                    label: {
                                        show: true,
                                        textStyle: {
                                            color: $scope.color.info
                                        }
                                    },
                                    labelLine: {
                                        show: true,
                                        lineStyle: {
                                            color: $scope.color.info
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        };

        function random() {
            var r = Math.round(Math.random() * 100);
            return (r * (r % 2 == 0 ? 1 : -1));
        }

        function randomDataArray() {
            var d = [];
            var len = 100;
            while(len--) {
                d.push([
                    random(),
                    random(),
                    Math.abs(random()),
                ]);
            }
            return d;
        }

        $scope.scatter2 = {};
        $scope.scatter2.options = {
            tooltip: {
                trigger: 'axis',
                showDelay: 0,
                axisPointer: {
                    show: true,
                    type: 'cross',
                    lineStyle: {
                        type: 'dashed',
                        width: 1
                    }
                }
            },
            legend: {
                data: ['scatter1', 'scatter2']
            },
            xAxis: [
                {
                    type: 'value',
                    splitNumber: 4,
                    scale: true
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitNumber: 4,
                    scale: true
                }
            ],
            series: [
                {
                    name: 'scatter1',
                    type: 'scatter',
                    symbolSize: function(value) {
                        return Math.round(value[2] / 5);
                    },
                    itemStyle: {
                        normal: {
                            color: 'rgba(107,188,215,.5)'
                        }
                    },
                    data: randomDataArray()
                },
                {
                    name: 'scatter2',
                    type: 'scatter',
                    symbolSize: function(value) {
                        return Math.round(value[2] / 5);
                    },
                    itemStyle: {
                        normal: {
                            color: 'rgba(129,202,128,.5)'
                        }
                    },
                    data: randomDataArray()
                }
            ]
        }

    }

})();
