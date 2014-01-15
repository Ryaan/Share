"use strict";

angular.module('app', [
	'ngCookies', 
	'ngResource', 
    'ui.router.compat',
    'ngAnimate',
	'ui.bootstrap', 
	'ui.route', 
	'ui.router',
    //'http-auth-interceptor',
    //'app.filters',
    'app.services',
    //'app.directives',
    'app.controllers'
])
.config(['$stateProvider','$locationProvider',
    function($stateProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $stateProvider.state('home', {
            url:'/',
            templateUrl: '/views/index.html',
            controller: function($scope){

            }
        });

        $stateProvider.state('messages',{
            abstract:true,
            url: '/messages',
            templateUrl: '/views/messages.html',
            controller: 'MessagesController' 
        })
        .state('messages.thread', {
            url:'/:user',
            templateUrl: '/views/messages.thread.html',
            controller: 'ThreadController' 
        });

        $stateProvider.state('other', {
            url: '/other',
            template: '<div class="folder-info"><div class="title">Other Page</div>',
            controller: function($scope){

            }
        });

        //$urlRouterProvider.otherwise("/404");

}])
.run(function($rootScope, $location, $state, SessionService, socket){
	var authStates = ['home.profile', 'search', 'messages', 'messages.thread'];
    if(SessionService.isAuthenticated()){
        window.socket = io.connect();
    }
	$rootScope.$on('$stateChangeStart', function(event, next, current) {
    	if(_(authStates).contains(next.name) && ! SessionService.isAuthenticated()) {
            //alert("Not authed"+JSON.stringify(window.user)+!! window.user+JSON.stringify(Global.user));
            $state.go('home.login');
            event.preventDefault();
        }else if(!_(authStates).contains(next.name) &&  SessionService.isAuthenticated()){
        	$state.go('home.profile');
        	event.preventDefault();
        }
  });
});