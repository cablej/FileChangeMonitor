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
        $scope.formError = error.data.message;
        console.log(error)
      });
  }

  this.fetchFileContents = function() {
    this.loading = true;
    File.fetchFileContents($stateParams.id)
      .then(response => {
        this.fileContents = response.data;

        this.fileContents.data[0] = this.filterString(this.fileContents.data[0]);
        this.fileContents.data[2] = this.filterString(this.fileContents.data[2]);

        if(this.fileContents.data[0].trim() == '') {
          this.fileContents.data[0] = '<i>Empty file</i>';
        }
        if(this.fileContents.data[2].trim() == '') {
          this.fileContents.data[2] = '<i>No relative urls found</i>';
        }

        //format relative url diff
        this.fileContents.data[1] = this.formatDiff(this.fileContents.data[1]);
        //format file diff
        this.fileContents.data[3] = this.formatDiff(this.fileContents.data[3]);

        this.loading = false;
      })
      .catch((error) => {
        console.log(error)
      });
  }

  this.reloadFile = function() {
    File.reloadFile($stateParams.id)
      .then(response => {
        this.fileContents = response.data;
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