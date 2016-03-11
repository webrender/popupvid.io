var UserCtrl = angular.module('UserCtrl', ['ngCookies']);
var init = function() {
	window.loadButtons();
};
var login = function(obj) {
	window.loginSuccess(obj);
};

function UserController($scope, $window, $document, $timeout, $http, $cookies) {

	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true; po.defer = true;
    po.src = 'https://apis.google.com/js/platform.js?onload=init';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

	$window.loadButtons = function() {
		$timeout(function() {
			gapi.signin2.render('signin-button', {onsuccess:'login', width: 36});
			gapi.signin2.render('save-signin-button', {onsuccess:'login', theme:'dark', longtitle: true, width: 175});
		});
	};

	$scope.showUserMenu = function() {
		$('.user-panel-popup').toggleClass('hidden');
	};
	$scope.hideUserPanel = function() {
		$('.user-panel-popup').addClass('hidden');
	};
	$scope.userMenuClick = function(e) {
		e.stopPropagation();
	};

	$scope.signOut = function() {
		$scope.$parent.username =
			$scope.$parent.googleFullName =
			$scope.$parent.userAvatar =
			$scope.$parent.googleId =
			$scope.$parent.authToken = false;
		$cookies.remove('authToken');
		auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut();

	};

	$window.loginSuccess = function(obj) {
		$scope.$parent.googleFullName = obj.getBasicProfile().getName();
		$scope.$parent.userAvatar = obj.getBasicProfile().getImageUrl();
		$scope.$parent.googleId = obj.getBasicProfile().getEmail();
		$scope.$parent.authToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
		$cookies.put('authToken', $scope.$parent.authToken);
		$http.get('/api/username').then(function(response){

			if (response.data)
				$scope.$parent.username = response.data;

			if ($scope.$parent.saveAfterLogin) {
				// if we've got a username, hide the .save modal and save the doc
				// if there's no username, show the .username modal instead
				if ($scope.$parent.username) {
					$('.save').modal('hide').on('hidden.bs.modal', function() {
						$scope.$parent.save();
					});
				} else {
					$('.save').modal('hide').on('hidden.bs.modal', function() {
						$('.username').modal('show').on('shown.bs.modal',function() {
							$('.usernameInput').focus();
						});
					});
				}

			}
		});
	};

}

UserCtrl.controller("UserController", ["$scope", "$window", "$document", "$timeout", "$http", "$cookies", UserController]);
