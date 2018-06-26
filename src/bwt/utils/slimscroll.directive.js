(function() {
    'use strict';

    angular.module('bwt.utils')
        .directive('slimScroll', slimScroll);

    // add class for specific pages to achieve fullscreen, custom background etc.
    function slimScroll() {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                return ele.slimScroll({
                    height: attrs.scrollHeight || '100%'
                });
            }
        };
    }
})();


