var app = angular.module('popupvid.io', ['ui.router', 'MainCtrl', 'EditCtrl', 'UserCtrl', 'HomeCtrl', 'NavCtrl', 'ListCtrl', 'ngSanitize', 'emojiApp']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider

        .state('home', {
            url: '/',
            views: {
                '': {
                    templateUrl: 'dist/views/home.html',
                    controller: 'HomeController'
                },

                'topnav@home': {
                    templateUrl: 'dist/views/topnav.html',
                    controller: 'NavController'
                },

                'usermenu@home': {
                    templateUrl: 'dist/views/usermenu.html',
                    controller: 'UserController'
                }
            }
        })

        .state('videos', {
            url: '/u/:username',
            views: {
                '': {
                    templateUrl: 'dist/views/list.html',
                    controller: 'ListController'
                },
                'topnav@videos': {
                    templateUrl: 'dist/views/topnav.html',
                    controller: 'NavController'
                },
                'usermenu@videos': {
                    templateUrl: 'dist/views/usermenu.html',
                    controller: 'UserController'
                }
            }
        })

        .state('editor', {
            url: '/:action/:videoid',
            views: {
                '': {
                    templateUrl: 'dist/views/editor.html',
                    controller: 'EditController'
                },

                'usermenu@editor': {
                    templateUrl: 'dist/views/usermenu.html',
                    controller: 'UserController'
                }
            }
        });

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

});
