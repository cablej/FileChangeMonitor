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
    .state('account', {
	      url: '/account',
	      templateUrl: 'views/account.html',
	      controller: 'UserController',
	      controllerAs: 'ctrl'
	    })
    .state('billing', {
	      url: '/billing',
	      templateUrl: 'views/billing.html',
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
		.state('viewDomain', {
	      url: '/domain/:id/',
	      templateUrl: 'views/viewDomain.html',
	      controller: 'DomainController',
	      controllerAs: 'ctrl'
	    })
		.state('editDomain', {
	      url: '/domain/:id/edit',
	      templateUrl: 'views/editDomain.html',
	      controller: 'DomainController',
	      controllerAs: 'ctrl'
	    })
		.state('viewFile', {
	      url: '/file/:id/',
	      templateUrl: 'views/viewFile.html',
	      controller: 'FileController',
	      controllerAs: 'ctrl'
	    })
		.state('addFile', {
	      url: '/domain/:id/addFile',
	      templateUrl: 'views/addFile.html',
	      controller: 'DomainController',
	      controllerAs: 'ctrl'
	    })
		.state('editFile', {
	      url: '/file/:id/edit',
	      templateUrl: 'views/editFile.html',
	      controller: 'FileController',
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