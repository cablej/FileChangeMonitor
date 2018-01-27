angular.module('DomainController', []).controller('DomainController', function($scope, $state, $stateParams, $window, Domain) {

	this.domains = [];

	this.domain = {};

	this.previewedUrls = [];

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
		this.loading = true;
		Domain.create(this.domain)
		  .then(response => {
		    $state.go('dashboard');
		  })
		  .catch((error) => {
		  	this.loading = false;
		  	$scope.formError = error.data.message;
		    console.log(error)
		  });
	}

	this.addMultiple = function() {
		this.loading = true;
		this.domain.urls = [];
		for (url of this.previewedUrls) {
			if(url.selected) {
				this.domain.urls.push(url.url);
			}
		}
		Domain.create(this.domain)
		  .then(response => {
		    $state.go('dashboard');
		  })
		  .catch((error) => {
		  	this.loading = false;
		  	$scope.formError = error.data.message;
		    console.log(error)
		  });
	}

	this.update = function() {
		this.loading = true;
		Domain.update(this.domain)
		  .then(response => {
		    $state.go('viewDomain', { id: this.domain._id });
		  })
		  .catch((error) => {
		  	this.loading = false;
		  	$scope.formError = error.data.message;
		    console.log(error)
		  });
	}

	this.previewJSUrls = function() {
		this.loading = true;
		var baseDomain = this.domain.baseDomain.startsWith('http') ?
			this.domain.baseDomain : 'http://' + this.domain.baseDomain;
		Domain.previewJSUrls(baseDomain)
			.then(response => {
				this.loading = false;
				this.previewedUrls = response.data.map((url) => {
					return { url: url }
				});
		  })
		  .catch((error) => {
				this.loading = false;
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