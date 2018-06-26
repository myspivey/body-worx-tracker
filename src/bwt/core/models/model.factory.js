(function() {
    'use strict';

    angular
        .module('bwt.core')
        .factory('model', modelFactory);

    function modelFactory($q, presenceModel, trainerModel, clientModel, bodyCompositionModel, statsModel, objects, Auth, CONSTANTS) {
        var factory = {
            copyright: new Date().getFullYear(),
            siteUrl: '',
            title: 'Loading...',
            debug: false,
            firebaseUser: null,
            presence: presenceModel,
            trainer: trainerModel,
            client: clientModel,
            bodyComposition: bodyCompositionModel,
            stats: statsModel,
            requireSignIn: function() {
                return routerMethodOnAuthPromise(true, false);
            },
            requireNotSignedIn: function() {
                return routerMethodOnAuthPromise(false, true);
            },
            waitForSignIn: function() {
                return routerMethodOnAuthPromise(false, false);
            },
            loggedIn: function() {
                return trainerModel.loggedIn;
            },
            loggedInTrainer: function() {
                return trainerModel.loggedInTrainer;
            },
            loggedInTrainerId: function() {
                return trainerModel.loggedInTrainer.$id;
            },
            generateEditStamp: function() {
                return new objects.EditStamp(trainerModel.loggedInTrainer.$id);
            },
            destroy: destroy,

            //TODO: Store in DB? Cookies?
            style: {
                menu: 'vertical',                               // 'horizontal', 'vertical', 'collapsed'
                fixedHeader: true,                              // true, false
                fixedSidebar: true,                             // true, false
                skin: '12'                                      // 11,12,13,14,15,16; 21,22,23,24,25,26; 31,32,33,34,35,36
            }

        };

        angular.merge(factory, CONSTANTS);

        return factory;

        function destroy() {
            factory.presence.destroy();
            factory.trainer.destroy();
            factory.client.destroy();
            factory.bodyComposition.destroy();
            factory.stats.destroy();
        }

        function routerMethodOnAuthPromise(rejectIfAuthDataIsNull, rejectIfAuthDataIsNotNull) {
            return Auth.$waitForSignIn()
                .then(function(authData) {
                    if(rejectIfAuthDataIsNull && authData === null) {
                        return $q.reject("AUTH_REQUIRED");
                    }
                    else if( rejectIfAuthDataIsNotNull && authData !== null) {
                        return $q.reject("ALREADY_SIGNED_IN");
                    }
                    else if( authData !== null) {
                        return factory.trainer.getTrainerById(authData.uid).$loaded();
                    } else {
                        return $q.resolve();
                    }
                });
        }
    }

})();
