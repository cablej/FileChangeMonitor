angular.module('UserController', []).controller('UserController', function($scope, $state, $stateParams, $window, User, $auth) {

  this.user = {};

  this.authenticate = function(provider) {
    $auth.authenticate(provider)
      .then()
      .catch(loginErrorHandler);
  };

  this.fetch = function() {
    User.fetch()
    .then((response) => {
      this.user = response.data;
    }).catch((error) => {
      this.error = error;
      console.log(error);
    });
  }

  this.signup = function() {
    console.log(this.user)
    if (! this.user.password || this.user.password == '') {
      this.error = 'Password is required';
      return;
    } else if (this.user.password != this.user.confirmPassword) {
      this.error = 'Passwords must match.';
      return;
    }
    this.loading = true;
    $auth.signup({
      username: this.user.username,
      email: this.user.email,
      password: this.user.password
    }).catch((error) => {
      this.loading = false;
      this.error = error;
      console.log(error);
    });
  };

  this.login = function() {
    this.loading = true;
    $auth.login({ username: this.user.username, password: this.user.password })
      .then()
      .catch((error) => {
      this.loading = false;
      this.error = error;
      console.log(error);
    });
  };

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  }

});