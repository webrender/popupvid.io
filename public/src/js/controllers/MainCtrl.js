var MainCtrl = angular.module('MainCtrl', []);
var player, mouseX, mouseY;
var cardOpen = false;
var sidebarState = 0;
var currentX = 0;
var currentY = 0;

MainCtrl.directive('urlInput', ['$window', function($window) {
	return function($scope, $element){
		$element.bind('keyup', function(event) {
			if(event.which === 13) {
				event.preventDefault();
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
				var match = $scope.url.match(regExp);
				if (match && match[2].length == 11) {
					$window.location.href = '/n/' + match[2];
				}
			}
		});
	};
}]);

function MainController($scope) {

}

MainCtrl.controller("MainController", ["$scope", MainController]);
