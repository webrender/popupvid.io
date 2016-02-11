var app = angular.module('popupvid.io', ['ui.router', 'MainCtrl', 'EditCtrl', 'ngSanitize', 'emojiApp']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider

        .state('home', {
            url: '/',
            templateUrl: 'dist/views/home.html',
            controller: 'MainController'
        })

        .state('editor', {
            url: '/:action/:videoid',
            templateUrl: 'dist/views/editor.html',
            controller: 'EditController',
        });

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

});
