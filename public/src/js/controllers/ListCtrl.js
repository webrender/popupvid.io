var ListCtrl = angular.module('ListCtrl', []);

function ListController($scope, $http, $window, $stateParams) {

	if ($stateParams.username) {
		// $scope.listUser = $stateParams.username.charAt(0).toUpperCase() + $stateParams.username.slice(1);

        $scope.listUser = $stateParams.username;

        $http.get('/api/u/' + $stateParams.username).then(function(response) {
            $scope.videoList = response.data;
        }, function() {
            $('.genericError').modal('show');
        });

        $scope.confirmDelete = function(idx) {
            console.log('foo');
            $scope.index = idx;
            $('.confirmDelete').modal('show');
        };

        $scope.dismissDelete = function() {
            $scope.index = null;
            $('.confirmDelete').modal('hide');
        };

        $scope.delete = function(video) {
            $http.get('/api/delete/' + $scope.videoList[$scope.index].slug).then(function(response) {
                $('.confirmDelete').modal('hide');
                $scope.videoList.splice($scope.index, 1);
            }, function() {
                $('.genericError').modal('show');
            });
        };
	}
}

ListCtrl.controller("ListController", ["$scope", "$http", "$window", "$stateParams", ListController]);
