var MainCtrl = angular.module('MainCtrl', []);

MainCtrl.directive('urlInput', function() {
  return function($scope, $element){
    $element.bind('keyup', function(event) {
      	if(event.which === 13) {
	        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			var match = $scope.url.match(regExp);
			if (match && match[2].length == 11) {
			  	$('.player-container').show();
			  	$scope.player = new YT.Player('player', {
		          height: '390',
		          width: '640',
		          videoId: match[2],
		          events: {
		            'onReady': function(event){event.target.playVideo();}
		            //'onStateChange': onPlayerStateChange
		          }
		        });

			}
	        event.preventDefault();
	    }
    });
  };
});

MainCtrl.controller('MainController', function($scope) {

	$scope.tagline = 'To the moon and back!';	

	$scope.pause = function() {
		console.log('pause');
		$scope.player.stopVideo();
	};

});