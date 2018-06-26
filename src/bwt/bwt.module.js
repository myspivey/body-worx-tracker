(function() {
    'use strict';

    angular.module('bwt', [
        // Angular modules
        'ngAnimate',
        'ngAria',

        // 3rd Party Modules
        'ui.router',
        'ui.bootstrap',
        'ngTagsInput',
        'textAngular',
        'angular-loading-bar',
        'duScroll',
        'angularMoment',
        'angulartics',
        'angulartics.google.analytics',
        'firebase',

        // Custom modules
        'bwt.errors',
        'bwt.utils',
        'bwt.core',
        'bwt.nav',
        'bwt.login',
        'bwt.usermanagement',
        'bwt.app'
    ])
        .config(bwtConfig).run(bwtRun);

    function bwtConfig($stateProvider, $locationProvider, $analyticsProvider, $logProvider, $urlRouterProvider, CONSTANTS, FIREBASE_CONFIG) {
        var defaultView = '/app/measurements'; //Using measurements until I come up with content for the dashboard
        $urlRouterProvider.when('', defaultView);
        $urlRouterProvider.when('/', defaultView);

        // For any unmatched url, send to 404
        $urlRouterProvider.otherwise('/404');

        //SETUP FIREBASE
        firebase.initializeApp(FIREBASE_CONFIG);

        //Various other setup
        $locationProvider.html5Mode(true);

        $logProvider.debugEnabled(CONSTANTS.debug);

        $analyticsProvider.developerMode(CONSTANTS.debug);
        $analyticsProvider.trackExceptions(true);

        //On Debug sites, print out our details
        if(CONSTANTS.debug) {
            var $log = angular.injector(['ng']).get('$log');
            $log.info('DEBUG: ' + CONSTANTS.debug);
            $log.info('ENV: ' + CONSTANTS.env);
            $log.info('VERSION: ' + CONSTANTS.version);
            $log.info('TIMESTAMP: ' + CONSTANTS.timestamp);
            $log.info('BUILTBY: ' + CONSTANTS.builtBy);
            $log.info('FIREBASE authDomain: ' + FIREBASE_CONFIG.authDomain);
            $log.info('FIREBASE databaseURL: ' + FIREBASE_CONFIG.databaseURL);
            $log.info('FIREBASE storageBucket: ' + FIREBASE_CONFIG.storageBucket);

            //For Debugging Google Analytics
            $analyticsProvider.registerPageTrack(function(path) {
                $log.info('Page tracking: ', path);
            });
            $analyticsProvider.registerEventTrack(function(action, properties) {
                $log.info("Event tracking: ", action, properties);
            });
        }
    }

    function bwtRun($rootScope, $document, $state, Auth, model) {
        var defaultView = 'app.measurements'; //Using measurements until I come up with content for the dashboard

        //Set central model so we do not need injections anywhere to get app state/data
        //This model should only be used for data that needs to be displayed in multiple areas and good cleanup should be done.
        $rootScope.model = model;

        //Setup watcher to monitor style changes from the nav
        $rootScope.$watch('model.style', function(newVal, oldVal) {
            if(_.isUndefined(newVal) || _.isUndefined(oldVal)) return;
            if(newVal.menu === 'horizontal' && oldVal.menu === 'vertical') {
                $rootScope.$broadcast('nav:reset');
            }
            if(newVal.fixedHeader === false && newVal.fixedSidebar === true) {
                if(oldVal.fixedHeader === false && oldVal.fixedSidebar === false) {
                    model.style.fixedHeader = true;
                    model.style.fixedSidebar = true;
                }
                if(oldVal.fixedHeader === true && oldVal.fixedSidebar === true) {
                    model.style.fixedHeader = false;
                    model.style.fixedSidebar = false;
                }
            }
            if(newVal.fixedSidebar === true) {
                model.style.fixedHeader = true;
            }
            if(newVal.fixedHeader === false) {
                model.style.fixedSidebar = false;
            }
        }, true);

        //State Change Start Watcher
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
            //If we try to nav to login and they are already logged in, do not allow, kick to default view
            if(toState.name == 'login' && model.loggedIn()) {
                event.preventDefault();
                $state.go(defaultView);
            }
        });

        //State Change Success Watcher
        $rootScope.$on("$stateChangeSuccess", function(event, toState, fromState) {
            $document.scrollTo(0, 0); //Always reset scroll on nav
        });

        //State Change Error Watcher
        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
            switch(error) {
                case "AUTH_REQUIRED":
                    // Must be logged in to access this page, throw back to Login
                    event.preventDefault();
                    $state.go("login", {}, {reload: true});
                    break;
                case "ALREADY_SIGNED_IN":
                    // Must not logged in to access this page, throw to default view
                    event.preventDefault();
                    $state.go(defaultView);
                    break;
            }
        });

        //Auth State Watcher
        Auth.$onAuthStateChanged(function(authData) {
            if(_.isNil(authData)) {
                model.destroy(); //If we have logged out, cleanup model

                //If we are still showing something beyond login
                if($state.includes('app') && !$state.current.abstract) {
                    $state.reload();
                }
            } else if(!model.loggedIn()) {
                model.firebaseUser = authData;

                //If we are logged in but model does not reflect this, get trainer and update model.
                model.trainer.getTrainerById(authData.uid).$loaded().then(getTrainerResult);
            }
        });

        //Result of get trainer, update model to show signed in state
        function getTrainerResult(trainer) {
            if(!_.isNil(trainer)) {
                trainer.$firebaseUser = model.firebaseUser;
                model.trainer.loggedIn = true;
                model.trainer.loggedInTrainer = trainer;
                model.presence.setTrainerPresenceByTrainerId(trainer.$id);

                //If we are currently on login, move to default view
                if(!$state.includes('app')) {
                    $state.go(defaultView);
                }
            } else {
                throw new Error("No Trainer Found");
            }
        }
    }
})();








