var ListCtrl = angular.module('ListCtrl', []);

function ListController($scope, $http, $window, $stateParams) {

	if ($stateParams.username) {
		// $scope.listUser = $stateParams.username.charAt(0).toUpperCase() + $stateParams.username.slice(1);

        $scope.listUser = $stateParams.username;

        $http.get('/api/u/' + $stateParams.username).then(function(response) {
            $scope.videoList = response.data;
            console.log(response.data);
        }, function() {
            $('.genericError').modal('show');
        });

        $scope.confirmDelete = function(idx) {
            console.log(idx);
            $('.confirmDelete').modal('show');
        };
	}
}

ListCtrl.controller("ListController", ["$scope", "$http", "$window", "$stateParams", ListController]);
