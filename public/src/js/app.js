var app = angular.module('popupvid.io', ['ui.router', 'MainCtrl', 'EditCtrl', 'UserCtrl', 'HomeCtrl', 'NavCtrl', 'ngSanitize', 'emojiApp']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider

        .state('home', {
            url: '/',
            views: {
                '': {
                    templateUrl: 'dist/views/home.html',
                    controller: 'HomeController'
                },

                'topnav': {
                    templateUrl: 'dist/views/topnav.html',
                    controller: 'NavController'
                },

                'usermenu@home': {
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
