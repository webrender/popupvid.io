var NavCtrl = angular.module('NavCtrl', []);

NavCtrl.directive('urlInput', ['$window', function($window) {
    return function($scope, $element){
        $element.bind('keyup', function(event) {
            if(event.which === 13) {
                event.preventDefault();
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var match = $scope.url.match(regExp);
                if (match && match[2].length == 11) {
                    $window.location.href = '/n/' + match[2];
                } else {
                    $scope.getVideos($scope.url);
                }
            }
        });
    };
}]);

function NavController($scope, $http, $window) {

    $scope.openUploader = function() {
        $('.select').modal('show');
    };

    $scope.message = 'Currently trending videos:';

    $scope.getVideos = function(query) {
        if (query) {
            // Search API
            $http.get('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=' + query + '&key=AIzaSyD8vizJsg-5nnnu7jkTS-H9IC76EszFUCQ').then(function(response){
                $scope.videoResults = response.data.items;
                $scope.message = 'Results for "' + query + '":';
            }, function() {
                // Todo: error handling on this page
            });
        } else {
            // Videos API, trending videos
            $http.get('https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=6&key=AIzaSyD8vizJsg-5nnnu7jkTS-H9IC76EszFUCQ').then(function(response){
                $scope.videoResults = response.data.items;
                $scope.message = 'Currently trending videos:';
            }, function() {
                // Todo: error handling on this page
            });
        }
    };

    $scope.loadVideo = function(id) {
        $window.location.href = '/n/' + id;
    };

    $scope.getVideos();

    $scope.$watch('username', function() {
        if ($scope.$parent) {
            $scope.$parent.username = $scope.username;
        }
    });

}

NavCtrl.controller("NavController", ["$scope", "$http", "$window", NavController]);
