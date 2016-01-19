var EditCtrl = angular.module('EditCtrl', []);
var player, mouseX, mouseY, timer, tabTimer;
var cardOpen = false;
var sidebarState = 0;
var currentX = 0;
var currentY = 0;

EditCtrl.directive('isDraggable', function() {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs){
			elm.draggable({
				cancel: ".card-emoji, .card-settings, .card-text",
				containment: "parent",
				drag: function(event, ui) {
					if (window.innerHeight - ui.offset.top > 335) {
						$('.card-settings').removeClass('top left right').addClass('bottom');
					} else if (ui.offset.top > 265) {
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

function EditController($scope, $window, $document, $timeout, $http, $routeParams, $location) {
	
	switch($routeParams.action) {
		case 'v':
			$scope.readOnly = true;
			$http.get('/api/load/' + $routeParams.videoid).then(function(response) {
				resObj = JSON.parse(response.data[0].data);
				$scope.video = resObj.video;
				$scope.cardIndex = resObj.data;
				$('.sidebar-wrap').addClass('large');
			});
			break;
		case 'e':
			$http.get('/api/load/' + $routeParams.videoid).then(function(response) {
				resObj = JSON.parse(response.data[0].data);
				$scope.video = resObj.video;
				$scope.cardIndex = resObj.data;
			});
			break;
		case 'n':
			$scope.video = $routeParams.videoid;
			$scope.cardIndex = [];
			break;
	}

	$scope.$watch('video', function(data) {
		if ($scope.video) {
			if (YT.Player) {
				$scope.player = new YT.Player('player', {
					height: '100%',
					width: '100%',
					videoId: $scope.video,
					events: {
						'onReady': function(event){
							$('.player-container').show();
							$scope.player.mute();
							$('.editor').css({
								'visibility': 'visible',
								'opacity': '1'
							});
							if ($routeParams.action != 'v') {
								$('.intro').modal('show');
							} else {
								$scope.player.playVideo();
							}
							setTimeout(function() {
								$('.sidebar-wrap').removeClass('large');
							}, 2000);
						},
						'onStateChange': $scope.onPlayerStateChange
					},
					playerVars: {
						'playsinline': 1,
						'showinfo': 0,
						'rel': 0,
						'disablekb': 1,
						'iv_load_policy': 3
					}
				});
			} else {
				$window.onYouTubeIframeAPIReady = function() {
					$scope.player = new YT.Player('player', {
						height: '100%',
						width: '100%',
						videoId: $scope.video,
						events: {
							'onReady': function(event){
								$('.player-container').show();
								$scope.player.mute();
								$('.editor').css({
									'visibility': 'visible',
									'opacity': '1'
								});
								if ($routeParams.action != 'v') {
									$('.intro').modal('show');
								} else {
									$scope.player.playVideo();
								}
							},
							'onStateChange': $scope.onPlayerStateChange
						},
						playerVars: {
							'playsinline': 1,
							'showinfo': 0,
							'rel': 0,
							'disablekb': 1,
							'iv_load_policy': 3
						}
					});
				};
			}
		}
	});

	$scope.colorList = ['#7bd148','#5484ed','#a4bdfc','#46d6db','#7ae7bf','#51b749','#fbd75b','#ffb878','#ff887c','#dc2127','#dbadff','#e1e1e1', '#ffffff'];

	$scope.currentText = '';
	$scope.selectedEmoji = ':wolf:';
	$scope.emojiBgColor = '#7bd148';
	currentX = 0;
	currentY = 0;

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
		$('.sidebar-tab').removeClass('sidebar-tab-hidden');
		$scope.tabHider();
	};

	$scope.onPlayerStateChange = function(state) {
		clearTimeout(timer);
		if (state.data == 1){
			$scope.cardCheck();
			$scope.tabHider();

			if (cardOpen) {
				$scope.closeCard();
			}
		}
	};

	$scope.tabHider = function() {
		clearTimeout(tabTimer);
		tabTimer = setTimeout(function() {
			$('.sidebar-tab').addClass('sidebar-tab-hidden');
		}, 2000);
	};

	$scope.cardCheck = function() {
		var currentTime = $scope.player.getCurrentTime();
		for (var prop in $scope.cardIndex) {
			if ($scope.cardIndex[prop].time - currentTime > 0.49){
				$scope.setTimer(currentTime, $scope.cardIndex[prop]);
				break;
			}
		}
	};

	$scope.setTimer = function(time, data) {
		timer = setTimeout(function() {
			$scope.popupCard(data);
			$scope.cardCheck();
		}, ((data.time - time) * 1000));
	};

	$scope.popupCard = function(data){
		$scope.currentText = data.text;
		$scope.selectedEmoji = data.emoji;
		$scope.emojiBgColor = data.bg;
		$scope.$digest();
		$('.card').removeClass('bounceOut').addClass('bounceIn');
		$('.card').css({
			'visibility': 'visible',
			'top': data.y + '%',
			'left': data.x + '%'
		});
		$window.setTimeout(function() {
			$scope.closeCard();
		}, 2000);
	};

	$scope.pause = function() {
		if ($scope.player.getPlayerState() == 1) {
			$scope.player.pauseVideo();
			if (!$scope.readOnly){
				$scope.displayCard();
			}
		}
		if ($scope.player.getPlayerState() == 2) {
			if ($scope.readOnly) {
				$scope.player.playVideo();
			} else {
				if (cardOpen){
				$scope.closeCard();
				} else {
					$scope.displayCard();
				}
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
			if (window.innerHeight - cardOffset.top > 335) {
				$('.card-settings').removeClass('top left right').addClass('bottom');
			} else if (cardOffset.top > 265) {
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
			if (window.innerHeight - mouseY > 390) {
				$('.card-settings').removeClass('top left right').addClass('bottom');
			} else if (mouseY > 265) {
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
		if ($scope.cardIndex.length === 0) {
			$scope.cardIndex[0] = cardData;
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
		}
		$('.sidebar-wrap').addClass('small');
		window.setTimeout(function(){
			$scope.closeCard();
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

	$scope.enterSidebar = function() {
		$('.sidebar-tab .chevron').addClass('chevron-hidden');
		clearTimeout(tabTimer);
		if (!cardOpen){
			$scope.player.pauseVideo();
		}
	};

	$document.on('keypress', function(event){
		if ($scope.player && !cardOpen){
			if ($scope.player.getPlayerState() == 1)
				$scope.player.pauseVideo();
			else
				$scope.player.playVideo();
		}
	});

	$scope.leaveSidebar = function() {
		$('.sidebar-tab .chevron').removeClass('chevron-hidden');
		$scope.tabHider();
		if (!cardOpen && !$(".saveDialog").is(':visible')){
			$scope.player.playVideo();
		}
	};

	$scope.$watch('currentText', function(data) {
		if ($('.current-text')[0]){
			$timeout(function() {
				$('.current-text').removeClass('medium small').addClass('large');
				if ($('.current-text')[0].clientHeight < $('.current-text')[0].scrollHeight) {
					$('.current-text').removeClass('large').addClass('medium');
				}
				if ($('.current-text')[0].clientHeight < $('.current-text')[0].scrollHeight) {
					$('.current-text').removeClass('medium').addClass('small');
				}
			});
		}
	});

	$scope.save = function() {
		$scope.player.pauseVideo();
		var data = {
			video: $scope.video,
			data: $scope.cardIndex
		};
		if ($routeParams.action === 'n') {
			$http.post('/api/save', data).then(function(response) {
				$scope.savedUrl = $window.location.origin + '/v/' + response.data;
				$scope.editUrl = $window.location.origin + '/e/' + response.data;
				$scope.editId = response.data;
				$('.saveDialog').modal('show');
			});
		} else {
			$http.post('/api/save/' + $routeParams.videoid, data).then(function(response) {
				$scope.savedUrl = $window.location.origin + '/v/' + response.data;
				$scope.editUrl = $window.location.origin + '/e/' + response.data;
				$('.saveDialog').modal('show');
			});
		}
	};

	$('.saveDialog').on('hidden.bs.modal', function (e) {
		if ($routeParams.action == 'n'){ 
			$location.path('/e/' + $scope.editId);
		}
	});

}

EditCtrl.controller("EditController", ["$scope", "$window", "$document", "$timeout", "$http", "$routeParams", "$location", EditController]);
