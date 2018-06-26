(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('ClientsListItem', clientsListItemFactory);

    function clientsListItemFactory($firebaseUtils) {
        function ClientsListItem(snapshot) {
            // store the record id so AngularFire can identify it
            this.$id = snapshot.key;

            // apply the data
            this.update(snapshot);
        }

        ClientsListItem.prototype = {
            update: function(snapshot) {
                var oldData = angular.extend({}, this);

                // apply changes to this.data instead of directly on `this`
                angular.extend(this, snapshot.val());

                // add a parsed date to our widget
                this.$firstNameLastName = _.startCase(this.firstName + " " + this.lastName);
                this.$lastNameFirstName = _.capitalize(this.lastName) + ", " + _.capitalize(this.firstName);
                this.$birthdayFormatted = moment(this.birthday).format("MMM Do, YYYY");
                this.$age = moment().diff(moment(this.birthday), 'years');

                return !_.eq(this, oldData);
            },

            toJSON: function() {
                var toJsonData = angular.extend({}, this);
                delete toJsonData.toJSON; //Delete this otherwise we get into a recursive loop
                if(_.isDate(toJsonData.birthday)) {
                    toJsonData.birthday = toJsonData.birthday.getTime();
                }
                return $firebaseUtils.toJSON(toJsonData);
            }
        };

        return ClientsListItem;
    }

})();
