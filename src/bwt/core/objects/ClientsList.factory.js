(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('ClientsList', clientsListFactory);

    function clientsListFactory($firebaseArray, ClientsListItem) {
        function ClientsList(ref) {
            // call the super constructor
            return $firebaseArray.call(this, ref);
        }

        // override the add behavior to return a Widget
        ClientsList.prototype.$$added = function(snapshot) {
            return new ClientsListItem(snapshot);
        };

        // override the update behavior to call Widget.update()
        ClientsList.prototype.$$updated = function(snapshot) {
            return this.$getRecord(snapshot.key).update(snapshot);
        };

        // pass our constructor to $extend, which will automatically extract the
        // prototype methods and call the constructor appropriately
        return $firebaseArray.$extend(ClientsList);
    }

})();
