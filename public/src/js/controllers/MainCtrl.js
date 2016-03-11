var MainCtrl = angular.module('MainCtrl', []);
var player, mouseX, mouseY;
var cardOpen = false;
var sidebarState = 0;
var currentX = 0;
var currentY = 0;

function MainController($scope, $window) {
	$window.loadButtons = function() {

	};
	$window.loginSuccess = function() {

	};
}

MainCtrl.controller("MainController", ["$scope", "$window", MainController]);
