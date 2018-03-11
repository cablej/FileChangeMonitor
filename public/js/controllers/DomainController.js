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
				this.domain.urls.push(url);
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

	this.updateFiles = function() {
		this.loading = true;
		this.domain.urls = [this.domain.newUrl];
		Domain.addFiles(this.domain)
		  .then(response => {
		     $state.go('viewDomain', { id: this.domain._id });
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
					var fileName = url.split('/').pop();
					var baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
					var isImportant = this.isImportant(fileName);
					var isDynamic = this.isDynamic(fileName);

					return {
						url: url,
						selected: isImportant,
						dynamic: isDynamic,
						baseUrl: baseUrl + fileName.split('-')[0].split('.')[0],
						baseDomain: baseDomain
					}
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
		  	this.domain.url = this.domain.name;
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

	this.addUrl = function() {
		this.previewedUrls.push({
			url: this.domain.url,
			selected: true
		});
		this.domain.url = '';
	}

	// returns if a file name is important (likely to contain main functionality of the site)
	this.isImportant = function(fileName) {
		let importantNames = ['app', 'main', 'nav'];
		for (var i = importantNames.length - 1; i >= 0; i--) {
			if (fileName.includes(importantNames[i])) {
				return true;
			}
		}
		return false;
	}

	// returns if a file name is dynamically generated and should be checked for updates
	// formats: name.hash.js or name-hash.js
	this.isDynamic = function(fileName) {
		// case one
		let split = fileName.split('.');
		if (split.length >= 3) {
			if (this.isHash(split[split.length - 2])) {
				return true;
			}
		}
		// case two
		split = fileName.split('-');
		if (split.length >= 2) {
			if (this.isHash(split[split.length - 1].split('.')[0])) {
				return true;
			}
		}
		return false;
	}

	this.isHash = function(component) {
		return component.length >= 8 && /\d/.test(component);
	}

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  }

})

.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});