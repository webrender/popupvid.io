var EditCtrl = angular.module('EditCtrl', ['ngCookies', 'ngSilent']);
var player, mouseX, mouseY, timer, tabTimer;
var cardOpen = false;
var sidebarState = 0;
var currentX = 0;
var currentY = 0;
var init = function() {
	window.loadButtons();
};
var login = function(obj) {
	window.loginSuccess(obj);
};

EditCtrl.directive('isDraggable', ['$stateParams', function($stateParams) {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs){
			if ($stateParams.action === 'v'){
				elm.removeClass('draggable');
			} else {
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
		}
	};
}]);

EditCtrl.filter('secondsToDateTime', [function() {
	return function(seconds) {
		return new Date(1970, 0, 1).setSeconds(seconds);
	};
}]);

function EditController($scope, $window, $document, $timeout, $http, $stateParams, $location, $cookies, $ngSilentLocation) {

	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true; po.defer = true;
    po.src = 'https://apis.google.com/js/platform.js?onload=init';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

	$window.loadButtons = function() {
		$timeout(function() {
			gapi.signin2.render('signin-button', {onsuccess:'login', width: 36});
			gapi.signin2.render('save-signin-button', {onsuccess:'login', theme:'dark', longtitle: true, width: 175});
		});
	};

	$scope.mode = $stateParams.action;
	$scope.videoId = $stateParams.videoid;
	switch($scope.mode) {
		case 'v':
			$scope.readOnly = true;
			$http.get('/api/load/' + $scope.videoId).then(function(response) {
				resObj = response.data[0];
				console.log(resObj);
				$scope.video = resObj.video;
				$scope.cardIndex = JSON.parse(resObj.data);
				$scope.title = resObj.title;
				$scope.creator = resObj.username;
				$('.sidebar-wrap').addClass('large');
			}, function() {
				$('.genericError').modal('show');
			});
			break;
		case 'e':
			$http.get('/api/load/' + $scope.videoId).then(function(response) {
				resObj = response.data[0];
				$scope.video = resObj.video;
				$scope.cardIndex = JSON.parse(resObj.data);
				$scope.title = resObj.title;
			}, function() {
				$('.genericError').modal('show');
			});
			break;
		case 'n':
			$scope.video = $scope.videoId;
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
							$('.editor').css({
								'visibility': 'visible',
								'opacity': '1'
							});
							if ($scope.mode == 'n' && $cookies.get('noIntro') != 'true') {
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
						'iv_load_policy': 3,
						'origin': 'http://' + document.location.hostname
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
								$('.editor').css({
									'visibility': 'visible',
									'opacity': '1'
								});
								if ($scope.mode == 'n' && $cookies.get('noIntro') != 'true') {
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
							'iv_load_policy': 3,
							'origin': 'http://' + document.location.hostname
						}
					});
				};
			}
		}
	});

	$scope.$on('$locationChangeStart', function(event, url) {
		$('.modal-backdrop').remove();
	});

	$scope.colorList = ['#7bd148','#5484ed','#a4bdfc','#46d6db','#7ae7bf','#51b749','#fbd75b','#ffb878','#ff887c','#dc2127','#dbadff','#e1e1e1', '#ffffff'];

	$scope.currentText = '';
	$scope.selectedEmoji = ':wolf:';
	$scope.emojiBgColor = '#7bd148';
	$scope.title = 'Untitled Video';
	$scope.saveAfterLogin = false;
	$scope.dismissIntro = false;
	$scope.introStep = 1;
	$scope.introText = 'NEXT';
	currentX = 0;
	currentY = 0;

	$scope.resizeEvent = function() {
		$('.player-container').css('height', document.body.clientWidth * 0.5625);
	};

	var w = angular.element($window);
	w.bind('resize', $scope.resizeEvent());

	$('.intro').on('hidden.bs.modal', function (e) {
		if ($scope.dismissIntro){
			$cookies.put('noIntro', 'true');
		}
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
		if (state.data == 1){  // playing
			$scope.leaveSidebar();
			$scope.cardCheck();
			$scope.tabHider();

			if (cardOpen) {
				$scope.closeCard();
			}
		} else if (state.data == 2 && !$scope.suppressSidebar) {  // paused
			$scope.enterSidebar();
		}
	};

	$scope.tabHider = function() {
		clearTimeout(tabTimer);
		tabTimer = setTimeout(function() {
			$('.sidebar-tab').addClass('sidebar-tab-hidden');
		}, 2000);
	};

	// There's some sort of race condition occurring with the cardCheck timing that
	// I'll eventually have to fix.

	$scope.cardCheck = function() {
		var currentTime = $scope.player.getCurrentTime();
		for (var prop in $scope.cardIndex) {
			if ($scope.cardIndex[prop].time - currentTime > 0){
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
		var playerState = $scope.player.getPlayerState();
		if (playerState == 1) { // video playing
			if (!$scope.readOnly){ // we're in edit mode - not view mode
				$scope.suppressSidebar = true;
				$scope.player.pauseVideo();
				$scope.displayCard();
			} else {
				$scope.player.pauseVideo();
			}
		} else if (playerState == 2) { // video paused
			if ($scope.readOnly) {
				$scope.player.playVideo();
			} else {
				if (cardOpen){
					$scope.closeCard();
				} else {
					$scope.displayCard();
				}
			}
		} else if (playerState === 0) { // video ended
			$scope.player.playVideo();
		}
	};

	$scope.displayCard = function(card) {
		if (card){
			$scope.currentTime = card.time;
			$scope.player.seekTo(card.time);
			$scope.suppressSidebar = true;
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
			$scope.suppressSidebar = false;
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
		$('.sidebar-tab .tab-icon').addClass('tab-icon-hidden');
		$('.sidebar-wrap').addClass('open');
		//	clearTimeout(tabTimer);
		//	if (!cardOpen){
		//		$scope.player.pauseVideo();
		//	}
	};

	$scope.leaveSidebar = function() {
		$('.sidebar-tab .tab-icon').removeClass('tab-icon-hidden');
		$('.sidebar-wrap').removeClass('open');
		$('.user-panel-popup').addClass('hidden');
		$(".form-title").blur();
		$scope.tabHider();
		//	if (!cardOpen && !$(".saveDialog").is(':visible')){
		//		$scope.player.playVideo();
		//	}
	};

	$document.on('keypress', function(event){
		if ($scope.player && !cardOpen && !$(".form-title").is(':focus')){
			if ($scope.player.getPlayerState() == 1)
				$scope.player.pauseVideo();
			else
				$scope.player.playVideo();
		}
	});

	$scope.saveAfter = function() {
		$scope.saveAfterLogin = true;
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
		$scope.username =
			$scope.googleFullName =
			$scope.userAvatar =
			$scope.googleId =
			$scope.authToken = false;
		$cookies.remove('authToken');
		auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut();

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

	$scope.saveAnonymously = function() {
		$scope.save(true);
	};

	$scope.preventDefault = function(e) {
		e.stopPropagation();
	};

	$scope.userCheck = function() {
		$scope.usernameAlert = false;
		var data = {
			username: $scope.usernameInput
		};
		$http.post('/api/username', data).then(function(response){
			if (response.data.error){
				$scope.usernameAlert = response.data.error;
			} else {
				$('.username').modal('hide').on('hidden.bs.modal', function() {
					$scope.username = $scope.usernameInput;
					$scope.save();
				});
			}
		}, function() {
			$('.username').modal('hide').on('hidden.bs.modal', function() {
				$genericError.modal('show');
			});
		});
	};

	$window.loginSuccess = function(obj) {
		$scope.googleFullName = obj.getBasicProfile().getName();
		$scope.userAvatar = obj.getBasicProfile().getImageUrl();
		$scope.googleId = obj.getBasicProfile().getEmail();
		$scope.authToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
		$cookies.put('authToken', $scope.authToken);
		$http.get('/api/username').then(function(response){

			if (response.data)
				$scope.username = response.data;

			if ($scope.saveAfterLogin) {
				// if we've got a username, hide the .save modal and save the doc
				// if there's no username, show the .username modal instead
				if ($scope.username) {
					$('.save').modal('hide').on('hidden.bs.modal', function() {
						$scope.save();
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

	$scope.save = function(anonymous) {
		$scope.player.pauseVideo();
		var data;
		if (anonymous) {
			data = {
				video: $scope.video,
				googleId: 'Anonymous',
				title: $scope.title,
				data: $scope.cardIndex
			};
		} else {
			if ($scope.authToken) {
				if ($scope.username) {
					data = {
						video: $scope.video,
						googleId: $scope.googleId,
						token: $scope.authToken,
						title: $scope.title,
						data: $scope.cardIndex
					};
				} else {
					$('.username').modal('show').on('shown.bs.modal',function() {
						$('.usernameInput').focus();
					});
					return;
				}
			} else {
				$('.save').modal('show');
				return;
			}
		}

		if ($scope.mode === 'n') {
			$http.post('/api/save', data).then(function(response) {
				$scope.savedUrl = $window.location.origin + '/v/' + response.data;
				$scope.editUrl = $window.location.origin + '/e/' + response.data;
				$scope.videoId = response.data;
				$('.saveDialog').modal('show');
			}, function() {
				$('.genericError').modal('show');
			});
		} else {
			$http.post('/api/save/' + $scope.videoId, data).then(function(response) {
				$scope.savedUrl = $window.location.origin + '/v/' + response.data;
				$scope.editUrl = $window.location.origin + '/e/' + response.data;
				$('.saveDialog').modal('show');
			}, function() {
				$('.genericError').modal('show');
			});
		}
	};

	$('.saveDialog').on('hidden.bs.modal', function (e) {
		if ($scope.mode == 'n'){
			$ngSilentLocation.silent('/e/' + $scope.videoId);
			$scope.mode = 'e';
		}
	});

	$('.username').on('hidden.bs.modal', function (e) {
		if ($scope.username) {
			$scope.save();
		}
	});

	$scope.introNext = function(step) {
		var introStep;
		if (step) {
			introStep = $scope.introStep = step;
		} else {
			$scope.introStep++;
			introStep = $scope.introStep;
		}
		switch(introStep) {
			case 1:
				break;
			case 2:
				$scope.introText = 'LET\'S GO!';
				break;
		}

	};

}

EditCtrl.controller("EditController", ["$scope", "$window", "$document", "$timeout", "$http", "$stateParams", "$location", "$cookies", "$ngSilentLocation", EditController]);
