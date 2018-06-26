(function() {
    'use strict';

    angular.module('bwt.utils')
        .directive('uiFileUpload', uiFileUpload);

    // add class for specific pages to achieve fullscreen, custom background etc.
    function uiFileUpload() {
        return {
            restrict: 'A',
            link: function(scope, ele) {
                ele.bootstrapFileInput();
            }
        }
    }
})();


