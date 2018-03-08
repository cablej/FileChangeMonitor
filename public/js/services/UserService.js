angular.module('User', []).service('User', ['$http', function($http) {

  this.fetch = function() {
    return $http.get('/user/me');
  }

  this.createBraintreeSubscription = function(nonce) {
    return $http.post('/user/braintree/createSubscription', {
      payment_method_nonce: nonce
    });
  }

  this.cancelBraintreeSubscription = function(nonce) {
    return $http.post('/user/braintree/cancelSubscription');
  }

}]);