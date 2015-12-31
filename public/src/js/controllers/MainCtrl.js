var MainCtrl = angular.module('MainCtrl', []);
var player, mouseX, mouseY;
var cardOpen = false;
var sidebarState = 0;
var currentX = 0;
var currentY = 0;

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
					currentX = (ui.offset.left/$(".player-container").width())*100;
					currentY = (ui.offset.top/$(".player-container").height())*100;
				}
			});
		}
	};
});

function MainController($scope, $window) {

	$scope.url = "https://www.youtube.com/watch?v=KLB8Sjj7g0M";

	$scope.colorList = ['#7bd148','#5484ed','#a4bdfc','#46d6db','#7ae7bf','#51b749','#fbd75b','#ffb878','#ff887c','#dc2127','#dbadff','#e1e1e1', '#ffffff'];

	$scope.currentText = '';
	$scope.selectedEmoji = ':wolf:';
	$scope.emojiBgColor = '#7bd148';
	currentX = 0;
	currentY = 0;

	$scope.cardIndex = [];

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

	$scope.pause = function() {
		if ($scope.player.getPlayerState() == 1) {
			$scope.player.pauseVideo();
			$scope.displayCard();
		}
	};

	$scope.displayCard = function(card) {
		if (card){
			$scope.currentTime = card.time;
			$scope.player.seekTo(card.time);
			$scope.player.pauseVideo();
			$scope.currentText = card.text;
			$scope.selectedEmoji = card.emoji;
			$scope.emojiBgColor = card.bg;

			$('.card').removeClass('bounceOut').addClass('bounceIn');
			$('.card').css({
				'visibility': 'visible',
				'top': card.y + '%',
				'left': card.x + '%'
			});
			if ($('.card').offset().top < 395){
				$('.card-settings').removeClass('top').addClass('bottom');
			} else {
				$('.card-settings').removeClass('bottom').addClass('top');
			}
			window.setTimeout(function() {
				$('.card-settings').css('visibility','visible').removeClass('fadeOut').addClass('fadeIn');
			}, 500);
			$('.current-text').focus();
		} else {
			$scope.currentTime = $scope.player.getCurrentTime();
			var offset = $(".player-container").offset();
			currentX = ((mouseX - 32)/$(".player-container").width())*100;
			currentY = ((mouseY - offset.top - 32)/$(".player-container").height())*100;
			$('.card').removeClass('bounceOut').addClass('bounceIn');
			$('.card').css({
				'visibility': 'visible',
				'top': currentY + '%',
				'left': currentX + '%'
			});
			if (window.innerHeight - mouseY < 395){
				$('.card-settings').removeClass('bottom').addClass('top');
			} else {
				$('.card-settings').removeClass('top').addClass('bottom');
			}
			window.setTimeout(function() {
				$('.card-settings').css('visibility','visible').removeClass('fadeOut').addClass('fadeIn');
			}, 500);
			$('.current-text').focus();
			cardOpen = true;
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

	$scope.closeCard = function(){
		$('.card-settings').removeClass('fadeIn').addClass('fadeOut');
		window.setTimeout(function() {
			$('.card').removeClass('bounceIn').addClass('bounceOut');
			$('.card-settings').css('visibility','hidden');
			cardOpen = false;
			$scope.player.playVideo();
			window.setTimeout(function() {
				$scope.currentText = '';
				$scope.selectedEmoji = ':wolf:';
				$scope.emojiBgColor = '#7bd148';
			}, 500);
		}, 500);
	};

	$scope.saveCard = function() {
		var cardData = {
			'time': $scope.currentTime,
			'text': $scope.currentText,
			'emoji': $scope.selectedEmoji,
			'bg': $scope.emojiBgColor,
			'x': currentX,
			'y': currentY
		};
		if ($scope.cardIndex.length === 0) {
			$scope.cardIndex[0] = cardData;
			$scope.closeCard();
		} else {
			for (var i = 0; i < $scope.cardIndex.length; i++){
				if ($scope.cardIndex[i].time === $scope.currentTime){
					$scope.cardIndex[i] = cardData;
					break;
				} else if (i+1 === $scope.cardIndex.length) {
					$scope.cardIndex.push(cardData);
					break;
				} else if ($scope.cardIndex[i].time > $scope.currentTime) {
					$scope.cardIndex.splice(i, 0, cardData);
					break;
				}
			}
			$scope.closeCard();
		}
	};

	$scope.deleteCard = function() {
		for (var i = 0; i < $scope.cardIndex.length; i++){
			if ($scope.cardIndex[i].time === $scope.currentTime){
				$scope.cardIndex.splice(i,1);
				break;
			}
		}
		$scope.closeCard();
	};
}

MainCtrl.controller("MainController", ["$scope", "$window", MainController]);
