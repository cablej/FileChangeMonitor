angular.module('Domain', []).service('Domain', ['$http', function($http) {

  this.create = function(object) {
    return $http.post('/api/domains', object);
  }

  this.addFiles = function(object) {
    return $http.post('/api/domains/' + object._id + '/addFiles', object);
  }

  this.update = function(object) {
    return $http.post('/api/domains/' + object._id, object);
  }

  this.fetchAll = function() {
    return $http.get('/api/domains');
  }

  this.fetchOne = function(id) {
    return $http.get('/api/domains/' + id);
  }

  this.previewJSUrls = function(url) {
    return $http.post('/api/domains/previewJSUrls', { url: url });
  }

  this.delete = function(id) {
    return $http.delete('/api/domains/' + id);
  }

}]);