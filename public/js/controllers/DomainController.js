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

	this.fetchFileContents = function() {
		Domain.fetchFileContents($stateParams.id)
		  .then(response => {
		  	this.fileContents = response.data;
		  	this.fileContents.data[3] = this.formatDiff(this.fileContents.data[3]);
		  	this.fileContents.data[1] = this.formatDiff(this.fileContents.data[1]);
		  })
		  .catch((error) => {
		    console.log(error)
		  });
	}

	this.reloadFile = function() {
		Domain.reloadFile($stateParams.id)
		  .then(response => {
		  	this.fileContents = response.data;
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

	this.formatDiff = function(diff) {
		if(diff == '') return '<i>No new content</i>';
		try {
			let parsed = JSON.parse(diff);
			if(parsed.error) {
				return '<i>No new content</i>';
			}
			console.log(parsed)
			let formattedDiff = '';
			for (diffString of parsed) {
				if (diffString.added) {
					formattedDiff += '<span style="color:green">' + diffString.value + '</span>';
				} else if (diffString.removed) {
					formattedDiff += '<span style="color:red">' + diffString.value + '</span>';
				} else {
					formattedDiff += diffString.value;
				}
			}
			return formattedDiff;
		} catch (e) {
			return '<i>No new content</i>';
		}
	}

})

.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);