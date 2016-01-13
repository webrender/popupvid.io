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
							},
							'onStateChange': $scope.onPlayerStateChange
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
					console.log(ui.offset);
					if (window.innerHeight - ui.offset.top > 395) {
						$('.card-settings').removeClass('top left right').addClass('bottom');
					} else if (ui.offset.top > 325) {
						$('.card-settings').removeClass('bottom left right').addClass('top');
					} else if (ui.offset.left > 220) {
						$('.card-settings').removeClass('top bottom right').addClass('left');
					} else {
						$('.card-settings').removeClass('top bottom left').addClass('right');
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

	$scope.onPlayerStateChange = function(state) {
		if (state.data == 1 && cardOpen){
			$scope.closeCard();
		}
	};

	$scope.pause = function() {
		if ($scope.player.getPlayerState() == 1) {
			$scope.player.pauseVideo();
			$scope.displayCard();
		}
		if ($scope.player.getPlayerState() == 2) {
			if (cardOpen){
				$scope.closeCard();
			} else {
				$scope.displayCard();
			}
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
			var cardOffset = $('.card').offset();
			if (window.innerHeight - cardOffsetTop > 395) {
				$('.card-settings').removeClass('top left right').addClass('bottom');
			} else if (cardOffset.top > 325) {
				$('.card-settings').removeClass('bottom left right').addClass('top');
			} else if (cardOffset.left > 220) {
				$('.card-settings').removeClass('top bottom right').addClass('left');
			} else {
				$('.card-settings').removeClass('top bottom left').addClass('right');
			}
			window.setTimeout(function() {
				$('.card-settings').css('visibility','visible').removeClass('fadeOut').addClass('fadeIn');
				cardOpen = true;
				$('.current-text').focus();
			}, 500);
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
			if (window.innerHeight - mouseY > 450) {
				$('.card-settings').removeClass('top left right').addClass('bottom');
			} else if (mouseY > 325) {
				$('.card-settings').removeClass('bottom left right').addClass('top');
			} else if (mouseX > 220) {
				$('.card-settings').removeClass('top bottom right').addClass('left');
			} else {
				$('.card-settings').removeClass('top bottom left').addClass('right');
			}
			window.setTimeout(function() {
				$('.card-settings').css('visibility','visible').removeClass('fadeOut').addClass('fadeIn');
				cardOpen = true;
				$('.current-text').focus();
			}, 500);
		}
		$('.sidebar-wrap').addClass('smaller-hover');
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
			$('.sidebar-wrap').removeClass('smaller-hover');
			cardOpen = false;
			$scope.player.playVideo();
			window.setTimeout(function() {
				$scope.currentText = '';
				$scope.selectedEmoji = ':wolf:';
				$scope.emojiBgColor = '#7bd148';
				$('.sidebar-wrap').removeClass('small');
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
		$('.sidebar-wrap').addClass('small');
		window.setTimeout(function(){
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
		}, 500);

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
