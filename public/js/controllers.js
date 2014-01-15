angular.module('app.controllers', [])
	.controller('HeaderController', ['$scope','$rootScope','$state','AuthenticationService', 'SessionService', function($scope, $rootScope, $state, AuthenticationService, SessionService){

		$rootScope.$watch( function () { return SessionService.isAuthenticated(); }, function ( authorized ) {
			//alert("AuthenticationService status changed - " + authorized);
      		$rootScope.showLogin = !authorized;
      		if(SessionService.isAuthenticated()){
        		window.socket = io.connect();
    		}	
    	});
	  	$scope.credentials = { email: "", password: "" };

		$rootScope.showLogin = !SessionService.isAuthenticated();
		$scope.login = function(){
			AuthenticationService.login($scope.credentials).then(function(){
				//alert("SUCCESS");
				$state.transitionTo('home.profile');
			}, function(flash){
				alert("flash = " +flash);
			});
		}
	}])
	.controller('ProfileController', ['$scope','$state','$http','AuthenticationService','SessionService',function($scope, $state, $http, AuthenticationService, SessionService){
        $scope.testvar = SessionService.getUser().email;
        $scope.fbPhotos = null;
		$http({method: 'GET', url: '/api/users/fb'}).
		  success(function(data, status, headers, config) {
		  	$scope.fbPhotos = data;
		  }).
		  error(function(data, status, headers, config) {
			//alert("User did not use facebook.");
		  	$scope.fbPhotos = true;
		  });
                $scope.exit = function(){
                    AuthenticationService.logout().then(function(){
                        //alert("SUCCESS");
                        $state.transitionTo('home.login');
                    }, function(flash){
                        alert("flash = " +flash);
                    });
                }
            }])
	.controller('MessagesController', ['$scope','SessionService', function($scope, $stateParams){
		//alert('asdfas'+JSON.stringify($stateParams));
	}])
	.controller('ThreadController', ['$scope', '$stateParams','socket', 'SessionService', function($scope, $stateParams, socket, SessionService){
		alert(JSON.stringify($stateParams));
		$scope.message = "";
		$scope.messages = [{user: 'ryco', message: 'Hello'},{user: 'ry', message: 'Hello there'}]
		socket.on('welcome', function(data){
			console.log('Got socket io message - '+data.message);
		});
		socket.on('message', function(data){
			console.log('Message: '+JSON.stringify(data));
			$scope.messages.push({user: data.from, message: data.from+": "+data.message});
		});
		$scope.send = function(){
			socket.emit('message', { message: $scope.message, to: $stateParams.user, from: SessionService.getUser()._id });
			$scope.messages.push({user: SessionService.getUser().id, message: SessionService.getUser()._id +': '+$scope.message});
			$scope.message = "";
		}
		//$scope.
	}]);