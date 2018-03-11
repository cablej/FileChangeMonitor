angular.module('File', []).service('File', ['$http', function($http) {

  this.fetchOne = function(id) {
    return $http.get('/api/files/' + id);
  }

  this.update = function(object) {
    return $http.post('/api/files/' + object._id, object);
  }

  this.fetchFileContents = function(all, id) {
    return $http.get('/api/files/' + id + '/fileContents?all=' + all);
  }

  this.reloadFile = function(id) {
    return $http.post('/api/files/' + id + '/reloadFile');
  }

}]);