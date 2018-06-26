(function() {
    'use strict';

    angular.module('bwt.utils')
        .directive('customPage', customPage);

    // add class for specific pages to achieve fullscreen, custom background etc.
    function customPage() {
        var directive = {
            restrict: 'A',
            controller: ['$scope', '$element', '$location', customPageCtrl]
        };

        return directive;

        function customPageCtrl($scope, $element, $location) {
            var addBg, path;

            path = function() {
                return $location.path();
            };

            addBg = function(path) {
                $element.removeClass('body-wide body-err body-lock body-auth');
                switch(path) {
                    case '/404':
                    case '/500':
                        return $element.addClass('body-wide body-err');
                        break;
                    case '/login':
                    case '/signup':
                    case '/usermanagement':
                        return $element.addClass('body-wide body-auth');
                        break;
                }
            };

            addBg($location.path());

            $scope.$watch(path, function(newVal, oldVal) {
                if(newVal === oldVal) {
                    return;
                }
                return addBg($location.path());
            });
        }
    }

})();


