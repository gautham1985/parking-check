'use strict';

angular.module('parkingCheckApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngTouch',
        'ngAnimate',
        'ui.router',
        'gsDirectives',
        'ngStorage',
        'ngMap',
        'ngAutocomplete'
    ])
    .constant('$config', {
        app: {
            name: 'Parking Check'
        },
        package: {
            name: 'com.parkingcheck.gautham'
        },
        api: {
            prefix: 'http:/',
            url: 'api.parkwhiz.com',
            action: 'search',
            key: '840e0ffb46613429dd2e90c99316ff50',
            builder: function (params) {
                var api = this, apiBuilder;
                if (!params || !params.destination) {
                    return;
                }
                apiBuilder = [api.prefix, api.url, api.action].join('/');
                apiBuilder += '?destination=' + params.destination + '&key=' + api.key;
                return apiBuilder.replace(/\s/g, '+');
            },
            builderBackup: function (params) {
                //https://maps.googleapis.com/maps/api/place/search/json?location=LAT,LONG&radius=500&types=parking&key=AIzaSyBbW2hMLYX-YkJ4CqwObIuA1CynCoJ3tno&query=
                var prefix, suffix;
                if (params.type === 1) {
                    prefix = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=parking in ';
                }
                else {
                    prefix = 'https://maps.googleapis.com/maps/api/place/search/json?types=parking&location=';
                }
                suffix = '&radius=500&key=AIzaSyBbW2hMLYX-YkJ4CqwObIuA1CynCoJ3tno';
                return (prefix + params.destination + suffix).replace(/\s/g, '+');
            }
        },
        map: {
            linkType1: 'https://www.google.com/maps/dir/Current+Location/',
            linkType2: 'https://maps.google.com/maps?saddr=Current+Location&dirflg=w&daddr='
        },
        timer: 5 * 1000,
        geoConfig: {
            alternate: false,
            timeout: 10 * 1000
        }
    })
    .config(function ($stateProvider, $urlRouterProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/park');
        $stateProvider
            .state('app', {
                views: {
                    '@': {
                        templateUrl: '/views/app-page.html'
                    },
                    'Header@app': {
                        templateUrl: '/views/header.html',
                        controller: [
                            '$scope',
                            '$rootScope',
                            function ($scope, $rootScope) {
                                $scope.back = function () {
                                    $rootScope.$broadcast('$$back');
                                }
                            }
                        ]
                    },
                    'MenuPanel@': {
                        templateUrl: '/views/menu-panel.html',
                        controller: 'MenuPanelCtrl'
                    },
                    'Footer@app': {
                        templateUrl: '/views/footer.html'
                    }
                }
            })
            .state('app.park', {
                url: '/park',
                views: {
                    'Content@app': {
                        templateUrl: '/views/parking.html',
                        controller: 'ParkingCtrl'
                    }
                }
            })
            .state('app.park.locate', {
                url: '/locate/:latitude/:longitude',
                views: {
                    'Content@app': {
                        templateUrl: '/views/locate-user.html',
                        controller: 'LocateUserCtrl'
                    }
                }
            })
            .state('app.search', {
                url: '/search',
                views: {
                    'Content@app': {
                        templateUrl: '/views/search-parking.html',
                        controller: 'SearchParkingCtrl'
                    }
                }
            })
            .state('app.history', {
                url: '/history',
                views: {
                    'Content@app': {
                        templateUrl: '/views/history.html',
                        controller: 'HistoryCtrl'
                    }
                }
            })
            .state('app.connect', {
                url: '/connect',
                views: {
                    'Content@app': {
                        templateUrl: '/views/connect.html',
                        controller: 'ConnectCtrl'
                    }
                }
            });
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|geo|javascript):/);
    })
    .run([
        '$rootScope',
        '$state',
        '$deviceListeners',
        'NotificationService',
        '$config',
        'drawerParams',
        function ($rootScope, $state, $deviceListeners, NotificationService, $config, drawerParams) {
            $rootScope.$state = $state;
            $rootScope.$app = $config.app;
            $rootScope.drawerParams = drawerParams;
            $deviceListeners.init();
            $rootScope.$on('$$ready', function () {
                NotificationService.ready();
            });
            $rootScope.$on('$stateChangeStart', function () {
                drawerParams.close();
            });
            $rootScope.$on('$$back', function (event) {
                if (drawerParams.isDrawerOpen) {
                    event.preventDefault();
                    drawerParams.close();
                }
            });
        }
    ]);