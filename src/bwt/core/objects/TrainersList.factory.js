(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('TrainersList', trainersListFactory);

    function trainersListFactory($firebaseArray, TrainersListItem) {
        function TrainersList(ref) {
            // call the super constructor
            return $firebaseArray.call(this, ref);
        }

        // override the add behavior to return a Widget
        TrainersList.prototype.$$added = function(snapshot) {
            return new TrainersListItem(snapshot);
        };

        // override the update behavior to call Widget.update()
        TrainersList.prototype.$$updated = function(snapshot) {
            return this.$getRecord(snapshot.key).update(snapshot);
        };

        // pass our constructor to $extend, which will automatically extract the
        // prototype methods and call the constructor appropriately
        return $firebaseArray.$extend(TrainersList);
    }

})();
