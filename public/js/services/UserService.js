angular.module('User', []).service('User', ['$http', function($http) {

  this.fetch = function() {
    return $http.get('/user/me');
  }

}]);