(function () {
    'use strict';

    angular.module('bwt.utils')
        .factory('Auth', authFactory);

    function authFactory($firebaseAuth) {
        return $firebaseAuth();
    }

})();
