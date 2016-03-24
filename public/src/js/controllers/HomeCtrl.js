var HomeCtrl = angular.module('HomeCtrl', []);

function HomeController($scope, $http, $window) {

    $http.get('/api/recentVideos').then(function(response) {
        $scope.recentVideos = response.data;
    }, function(err) {
        console.log(err);
    });

    $window.onload = function() {
        $scope.animLoop();
    };

    var iter = 0;
    $scope.animLoop = function() {
        $('.home-card').addClass('bounceOut');
        setTimeout(function(){
            switch(iter) {
                case 0:
                    $('.home-card-text').text('input');
                    $('.home-card-emoji').removeClass('-blue').addClass('-green').text('👍️');
                    iter++;
                    break;
                case 1:
                    $('.home-card-text').text('fun');
                    $('.home-card-emoji').removeClass('-green').addClass('-red').text('🎉');
                    iter++;
                    break;
                case 2:
                    $('.home-card-text').text('trivia');
                    $('.home-card-emoji').removeClass('-red').addClass('-blue').text('ℹ️');
                    iter = 0;
                    break;
            }
            $('.home-card').removeClass('bounceOut').addClass('bounceIn');
            setTimeout(function(){
                $scope.animLoop();
            }, 6000);
        }, 1000);
    };

}

HomeCtrl.controller("HomeController", ["$scope", "$http", "$window", HomeController]);
