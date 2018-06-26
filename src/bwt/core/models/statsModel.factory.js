(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('statsModel', statsModelFactory);

    function statsModelFactory($firebaseObject, firebaseDatabase) {

        var stats;

        var factory = {
            getStats: getStats,
            saveStats: saveStats,
            destroy: destroy
        };

        return factory;

        ////////////

        function getStats() {
            if(checkPropertyNeedsLoading(stats)) {
                stats = $firebaseObject(firebaseDatabase.stats);
            }
            return stats;
        }

        function saveStats() {
            stats.lastUpdate = firebase.database.ServerValue.TIMESTAMP;
            return stats.$save();
        }

        function destroy() {
            if(!_.isUndefined(stats)) {
                stats.$destroy();
                stats = null;
            }
        }

        //UTIL FUNCTIONS

        function checkPropertyNeedsLoading(property) {
            return (_.isNil(property) || (!_.isNil(property) && property.$isDestroyed));
        }

    }

})();
