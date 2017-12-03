angular.module('DomainController', []).controller('DomainController', function($scope, $state, $stateParams, $window, Domain) {

	this.domains = [];

	this.domain = {};

	this.fetchAll = function() {
		Domain.fetchAll()
		  .then(response => {
		  	this.domains = response.data;
		  })
		  .catch((error) => {
		    console.log(error)
		  });
	}

	this.add = function() {
		Domain.create(this.domain)
		  .then(response => {
		    $state.go('dashboard');
		  })
		  .catch((error) => {
		  	$scope.formError = error.data.message;
		    console.log(error)
		  });
	}

	this.fetchOne = function() {
		Domain.fetchOne($stateParams.id)
		  .then(response => {
		  	this.domain = response.data;
		  })
		  .catch((error) => {
		    console.log(error)
		  });
	}

	this.delete = function(id) {
		if ($window.confirm('Delete this domain?')) {
			Domain.delete(id)
				.then(response => {
					this.domains = this.domains.filter((domain) => domain._id !== id);
			  })
			  .catch((error) => {
			    console.log(error)
			  });
		}
	}

});