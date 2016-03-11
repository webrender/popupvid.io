var HomeCtrl = angular.module('HomeCtrl', []);

function HomeController($scope, $http) {

	$scope.getVideos = function(query) {
		if (query) {
			// Search API
		} else {
			// Videos API, trending videos
			$http.get('https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=3&key=AIzaSyD8vizJsg-5nnnu7jkTS-H9IC76EszFUCQ').then(function(response){
				$scope.popularVideos = response.data.items;
				console.log($scope.popularVideos);
			}, function() {
				// Todo: error handling on this page
			});
		}
	};

	$scope.getVideos();

}

HomeCtrl.controller("HomeController", ["$scope", "$http", HomeController]);
