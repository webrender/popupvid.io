angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		//	home page
		.when('/', {
			templateUrl: 'dist/views/home.html',
			controller: 'MainController'
		})

		.when('/:action/:videoid', {
			templateUrl: 'dist/views/editor.html',
			controller: 'EditController',
		});

		//	.when('/nerds', {
		//	templateUrl: 'views/nerd.html',
		//	controller: 'NerdController'
		//	})

	$locationProvider.html5Mode(true);

}]);
