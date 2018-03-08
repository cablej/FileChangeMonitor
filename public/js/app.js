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
		'satellizer',
		'braintree-angular'
	])

	.constant('clientTokenPath', '/user/braintree/clientToken')

	.config(function($authProvider) {
		
	});