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


  /**
   * Creates a braintree subscription
   */
  this.createBraintreeSubscription = function(event, nonce) {
    angular.element(document.body).injector().get('User').createBraintreeSubscription(nonce)
      .then((response) => {
        window.location = '/account';
      })
      .catch((error) => {
        window.location = '/account';
      });
  }

  /**
   * Cancels a braintree subscription
   */
  this.cancelBraintreeSubscription = function() {
    if(confirm('Cancel your subscription?')) {
      this.loading = true;
      User.cancelBraintreeSubscription().then((response) => {
          window.location = '/account';
        })
        .catch((error) => {
          window.location = '/account';
        });
    }
  }

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  }

});