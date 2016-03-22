var ListCtrl = angular.module('ListCtrl', []);

function ListController($scope, $http, $window, $stateParams) {

	if ($stateParams.username) {
		$scope.listUser = $stateParams.username.charAt(0).toUpperCase() + $stateParams.username.slice(1);
	}
}

ListCtrl.controller("ListController", ["$scope", "$http", "$window", "$stateParams", ListController]);
