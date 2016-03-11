var NavCtrl = angular.module('NavCtrl', []);

function NavController($scope) {

    $scope.openUploader = function() {
        $('.select').modal('show');
    };

}

NavCtrl.controller("NavController", ["$scope", NavController]);
