var MainCtrl = angular.module('MainCtrl', []);
var player, mouseX, mouseY;
var cardOpen = false;
var sidebarState = 0;

MainCtrl.directive('urlInput', function() {
	return function($scope, $element){
		$element.bind('keyup', function(event) {
			if(event.which === 13) {
				event.preventDefault();
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
				var match = $scope.url.match(regExp);
				if (match && match[2].length == 11) {
					$('.player-container').show();
					$scope.player = new YT.Player('player', {
						height: '100%',
						width: '100%',
						videoId: match[2],
						events: {
						'onReady': function(event){
							$scope.player.mute();
							$('.editor').css({
								'visibility': 'visible',
								'opacity': '1'
							});
							$('.intro').modal('show');
						}
						//'onStateChange': onPlayerStateChange
					},
						playerVars: {
							controls: 0,
							playsinline: 1,
							showinfo: 0
						}
					});
				}
			}
		});
	};
});

MainCtrl.directive('isDraggable', function() {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs){
			// var options = scope.$eval(attrs.isDraggable);
			elm.draggable({
				cancel: ".card-emoji, .card-settings, .card-text",
				containment: "parent",
				drag: function(event, ui) {
					if (window.innerHeight - ui.offset.top < 395) {
						$('.card-settings').removeClass('bottom').addClass('top');
					} else {
						$('.card-settings').removeClass('top').addClass('bottom');
					}
				}
			});
		}
	};
});

function MainController($scope, $window) {

	$scope.url = "https://www.youtube.com/watch?v=KLB8Sjj7g0M";

	$scope.colorList = ['#7bd148','#5484ed','#a4bdfc','#46d6db','#7ae7bf','#51b749','#fbd75b','#ffb878','#ff887c','#dc2127','#dbadff','#e1e1e1', '#ffffff'];

	$scope.emojiMessage = {};
	$scope.selectedEmoji = '🐺';

	$scope.emojiBgColor = '#7bd148';

	$scope.resizeEvent = function() {
		$('.player-container').css('height', document.body.clientWidth * 0.5625);
	};

	var w = angular.element($window);
	w.bind('resize', $scope.resizeEvent());

	$('.intro').on('hidden.bs.modal', function (e) {
		$scope.player.playVideo();
	});

	$scope.resizeEvent = function() {
		$('.player-container').css('height', document.body.clientWidth * 0.5625);
	};

	$scope.mouseTracker = function(e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	};

	$scope.expandSidebar = function() {
		if (sidebarState === 0) {
			$('.sidebar').addClass('small');
			$('.sidebar .smaller').removeClass('disabled');
			sidebarState++;
		} else if (sidebarState == 1){
			$('.sidebar').removeClass('small').addClass('large');
			$('.sidebar .larger').addClass('disabled');
			sidebarState++;
		}
	};

	$scope.collapseSidebar = function() {
		if (sidebarState == 1) {
			$('.sidebar').removeClass('small');
			$('.sidebar .smaller').addClass('disabled');
			sidebarState--;
		} else if (sidebarState == 2){
			$('.sidebar').removeClass('large').addClass('small');
			$('.sidebar .larger').removeClass('disabled');
			sidebarState--;
		}
	};


	$scope.pause = function() {
		if ($scope.player.getPlayerState() == 1) {
			$scope.player.pauseVideo();
			$scope.expandSidebar();
			var offset = $(".player-container").offset();
			$('.card').removeClass('bounceOut').addClass('bounceIn');
			$('.card').css({
				'visibility': 'visible',
				'top': ((mouseY - offset.top - 32)/$(".player-container").height())*100 + '%',
				'left': ((mouseX - 32)/$(".player-container").width())*100 + '%'
			});
			if (window.innerHeight - mouseY < 395){
				$('.card-settings').addClass('top');
			} else {
				$('.card-settings').addClass('bottom');
			}
			window.setTimeout(function() {
				$('.card-settings').css('visibility','visible').addClass('fadeIn');
			}, 500);
			$('.current-text').focus();
			cardOpen = true;
		} else {
			//	if (cardOpen){
			//		$('.card').removeClass('bounceIn').addClass('bounceOut');
			//		$scope.collapseSidebar();
			//	cardOpen = false;
			//	}
			//	$scope.player.playVideo();
		}
	};

	$scope.picker = function() {
		$('.card-emoji-input').emojiPicker({
			height: '100px',
			width: '200px'
		});
	};

	$scope.colorSelect = function(color){
		$scope.emojiBgColor = color;
	};
}

MainCtrl.controller("MainController", ["$scope", "$window", MainController]);
