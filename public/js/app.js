angular.module('app',
	[
		'ngRoute',
		'ui.router',
		'appRoutes',
		'DomainController',
		'Domain',
		'UserController',
		'LogoutController',
		'User',
		'satellizer'
	])

	.config(function($authProvider) {
		
	});