var ListCtrl = angular.module('ListCtrl', []);

function ListController($scope, $http, $window, $stateParams) {

	console.log($scope);

}

ListCtrl.controller("ListController", ["$scope", "$http", "$window", "$stateParams", ListController]);
