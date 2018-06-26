(function() {
    'use strict';

    angular.module('bwt.core')
        .constant('CONSTANTS', {
            env: '@@CONSTANTS.env',
            version: '@@CONSTANTS.version',
            timestamp: '@@CONSTANTS.timestamp',
            builtBy: '@@CONSTANTS.builtBy',
            siteUrl: '@@CONSTANTS.siteUrl',
            title: '@@CONSTANTS.title',
            debug: @@CONSTANTS.debug
    })
    .constant('FIREBASE_CONFIG', {
        apiKey: '@@FIREBASE_CONFIG.apiKey',
        authDomain: '@@FIREBASE_CONFIG.authDomain',
        databaseURL: '@@FIREBASE_CONFIG.databaseURL',
        storageBucket: '@@FIREBASE_CONFIG.storageBucket',
        messagingSenderId: '@@FIREBASE_CONFIG.messagingSenderId'
    });

})();
