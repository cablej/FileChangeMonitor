angular.module('FileController', []).controller('FileController', function($scope, $state, $stateParams, $window, File) {

  this.file = {};

  this.fetchOne = function() {
    File.fetchOne($stateParams.id)
      .then(response => {
        this.file = response.data;
      })
      .catch((error) => {
        console.log(error)
      });
  }

  this.update = function() {
    this.loading = true;
    File.update(this.file)
      .then(response => {
        $state.go('viewFile', { id: this.file._id });
      })
      .catch((error) => {
        this.loading = false;
        $scope.formError = error.message;
        console.log(error)
      });
  }

  this.fetchFileContents = function(all) {
    this.loading = true;
    File.fetchFileContents(all, $stateParams.id)
      .then(response => {

        if (all == 'full') {
          this.fileContents = this.fileContents.concat(response.data.data);
          console.log(this.fileContents)
          this.fileContents[2] = this.filterString(this.fileContents[2]);

          if(this.fileContents[2].trim() == '') {
            this.fileContents[2] = '<i>Empty file</i>';
          }
          //format file diff
          this.fileContents[3] = this.formatDiff(this.fileContents[3]);
        } else {
          this.fileContents = response.data.data;

          this.fileContents[0] = this.filterString(this.fileContents[0]);

          if(this.fileContents[0].trim() == '') {
            this.fileContents[0] = '<i>No relative urls found</i>';
          }

          //format relative url diff
          this.fileContents[1] = this.formatDiff(this.fileContents[1]);

        }

        this.loading = false;
      })
      .catch((error) => {
        console.log(error)
      });
  }

  this.reloadFile = function() {
    File.reloadFile($stateParams.id)
      .then(response => {
        $window.location.reload();
      })
      .catch((error) => {
        console.log(error)
      });
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
          formattedDiff += '<span style="color:green">' + this.filterString(diffString.value) + '</span>';
        } else if (diffString.removed) {
          formattedDiff += '<span style="color:red">' + this.filterString(diffString.value) + '</span>';
        } else {
          // formattedDiff += diffString.value;
        }
      }
      return formattedDiff;
    } catch (e) {
      return '<i>No new content</i>';
    }
  }

  this.filterString = function(string) {
    return string.replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

})

.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);