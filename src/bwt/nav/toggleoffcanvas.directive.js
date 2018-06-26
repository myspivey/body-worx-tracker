(function() {
    'use strict';

    angular.module('bwt.nav')
        .directive('toggleOffCanvas', toggleOffCanvas);

    // toggle on-canvas for small screen, with CSS
    function toggleOffCanvas() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {
            ele.on('click', function() {
                return $('#app').toggleClass('on-canvas');
            });
        }
    }
})();



