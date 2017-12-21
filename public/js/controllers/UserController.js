angular.module('UserController', []).controller('UserController', function($scope, $state, $stateParams, $window, User, $auth) {

  this.user = {};

  this.authenticate = function(provider) {
    $auth.authenticate(provider)
      .then()
      .catch(loginErrorHandler);
  };

  this.signup = function() {
    $auth.signup({
      username: this.user.username,
      email: this.user.email,
      password: this.user.password
    }).catch((error) => {
      console.log(error);
    });
  };

  this.login = function() {
    $auth.login({ username: this.user.username, password: this.user.password })
      .then()
      .catch((error) => {
      console.log(error);
    });
  };

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  }

});