angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', '$stateProvider', function($routeProvider, $locationProvider, $stateProvider) {

	$stateProvider

		.state('register', {
	      url: '/register',
	      templateUrl: 'views/register.html',
	      controller: 'UserController',
	      controllerAs: 'ctrl'
	    })
	    .state('login', {
	      url: '/login',
	      templateUrl: 'views/login.html',
	      controller: 'UserController',
	      controllerAs: 'ctrl'
	    })
	    .state('logout', {
	      url: '/logout',
	      template: null,
	      controller: 'LogoutController'
	    })
		// home page
		.state('dashboard', {
	      url: '/',
	      templateUrl: 'views/home.html',
	      controller: 'DomainController',
	      controllerAs: 'ctrl'
	    })
		.state('view', {
	      url: '/:id/view',
	      templateUrl: 'views/view.html',
	      controller: 'DomainController',
	      controllerAs: 'ctrl'
	    })
		.state('create', {
	      url: '/create',
	      templateUrl: 'views/create.html',
	      controller: 'DomainController',
	      controllerAs: 'ctrl'
	    })

	$locationProvider.html5Mode(true);

}]);