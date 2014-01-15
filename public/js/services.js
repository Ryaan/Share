angular.module('app.services', [])
	.factory('AuthenticationService', ['$q', '$resource', 'SessionService', function($q, $resource, SessionService){

		return {
			login: function(credentials){
				var deferred = $q.defer();
				$resource("/api/auth/login").save(credentials, function(data){
					SessionService.setUser(data);
					//ModalAuthService.loginConfirmed();
					deferred.resolve();
				}, function(error){
					deferred.reject(error.data.message);
				});
				return deferred.promise;
			},

			logout: function(){
				var deferred = $q.defer();
				$resource("/api/auth/signout").get(function(data){
					SessionService.setUser(null);
					//alert(JSON.stringify(window.user));
					deferred.resolve();
				}, function(error){
					deferred.reject(error.data.message);
				});
				return deferred.promise;
			}
		}
	}])
	.factory('SessionService', [function(){
		var user = window.user;

		return {

			isAuthenticated: function(){
				return !!user;
			},

			getUser: function(){
				return user;
			},

			setUser: function(userval){
				user = userval;
			}
		}
	}])
	.factory('socket', function ($rootScope) {
	  	var socket = window.socket;
	  	return {
	    	on: function (eventName, callback) {
	      		socket.on(eventName, function () {  
	        		var args = arguments;
	        		$rootScope.$apply(function () {
	          			callback.apply(socket, args);
	        		});
	      		});
	    	},
		    emit: function (eventName, data, callback) {
		      	socket.emit(eventName, data, function () {
		        	var args = arguments;
		        	$rootScope.$apply(function () {
		          		if (callback) {
		            		callback.apply(socket, args);
		          		}
		        	});
		      	})
		    }
	  	};
	});