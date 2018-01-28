angular.module('DomainController', []).controller('DomainController', function($scope, $state, $stateParams, $window, Domain, $auth) {

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
		if (this.domain.url) {
			this.domain.urls.push(this.domain.url);
		}
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

	this.previewJSUrls = function(isNew = false) {
		if (this.previewedUrls.length > 0 && !isNew) return;
		if (!this.domain.baseDomain) return;
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

	this.previewBaseDomain = function() {
		let commonEndings = ['com', 'net', 'org', 'io', 'us', 'me', 'info'];
		for (var i = commonEndings.length - 1; i >= 0; i--) {
			if (this.domain.baseDomain.endsWith('.' + commonEndings[i])) {
				this.previewJSUrls(true);
				return;
			}
		}
	}

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  }

});