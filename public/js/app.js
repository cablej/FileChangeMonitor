angular.module('app',
	[
		'ngRoute',
		'ui.router',
		'appRoutes',
		'DomainController',
		'Domain',
		'FileController',
		'File',
		'UserController',
		'LogoutController',
		'User',
		'satellizer'
	])

	.config(function($authProvider) {
		
	});