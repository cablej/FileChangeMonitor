// grab the mongoose module
let paranoid = require('request');
let mongoose = require('mongoose');
let jsdiff = require('diff');
let AWS = require('aws-sdk');
let s3 = new AWS.S3();
var Promise = require("bluebird");
var helperMethods = require('../helperMethods');

const FileSchema = new mongoose.Schema({
  url: String,
  pollTime: {
    type: Number,
    validate: {
      validator: function(v) {
        return v >= 60 // Min poll time
      },
      message: 'Poll time must be at least 1 minute.'
    },
    default: 3600*24
  },
  notifyThreshold: {
    type: Number,
    validate: {
      validator: function(v) {
        return v >= 1
      },
      message: 'Threshold must be positive'
    },
    default: 1
  },
  notifyThresholdUnit: {
    type: String,
    enum: ['characters', 'urls'],
    default: 'urls'
  },
  pollOffset: {
    type: Number,
    select: false
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

FileSchema.pre('save', function (next) {
  if (this.pollTime && (!this.pollOffset || this.isModified('pollTime'))) {
    // set poll offset to random number for minute it processes
    this.pollOffset = helperMethods.randomInt(0, this.pollTime - 1);
    this.markModified('pollOffset');
  }
  next();
});

FileSchema.methods = {
  getFilteredFileUrl() {
      return this.id.replace(/\W/g, '');
  },
  // returns a promise of the contents of the remotely stored file
  // TODO: actually return a promise?
  getRemoteContents(error, success) {
      this.bulkReadFromBucket([{
          key: this.getFilteredFileUrl()
      }, {
          key: 'diff-' + this.getFilteredFileUrl()
      }, {
          key: 'urls-' + this.getFilteredFileUrl()
      }, {
          key: 'urls-diff-' + this.getFilteredFileUrl()
      }], (err) => {
          error(err);
      }, (data) => {
          success(data);
      });
  },
  // returns contents of arrays of files
  bulkReadFromBucket(keyArray, error, success) {
      let keyObject = keyArray.pop();
      s3.getObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: keyObject.key,
      }, (err, response) => {
          let responseConstruct = {};
          if (response && response.Body) {
              responseConstruct = response.Body.toString('utf8');
          }
          if (err || !response || !response.Body) {
              responseConstruct = { error: err }; //fail silently
          }
          if (keyArray.length > 0) {
              this.bulkReadFromBucket(keyArray, error, (responseArray) => {
                  success(responseArray.concat([responseConstruct]))
              });
          } else {
              success([responseConstruct]);
          }
      });
  },
  // writes an array of multiple data objects to the bucket
  bulkWriteToBucket(dataArray, error, success) {
    let dataObject = dataArray.pop();
    s3.putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: dataObject.key,
        Body: dataObject.data
    }, (err, response) => {
        let responseConstruct = response;
        if (err) {
            responseConstruct = { error: err }; //fail silently
        }
        if (dataArray.length > 0) {
            this.bulkWriteToBucket(dataArray, error, (responseArray) => {
                success(responseArray.concat(responseConstruct))
            });
        } else {
            success([responseConstruct]);
        }
    });
  },
  extractRelativeUrls(data) {
      let stringDelimiters = ['"', '\'', '`'];
      let urls = new Set();
      for (delimiter of stringDelimiters) {
          let segments = data.split(delimiter + '/');
          for (let i=1; i < segments.length; i++) { // begin at item 1
              let url = segments[i].substring(0, segments[i].indexOf(delimiter));
              urls.add('/' + url);
          }
      }
      return  Array.from(urls);
  },
  numLinesModified(diff) {
    let numLinesModified = 0;
    for (let i=0; i < diff.length; i++) {
        let part = diff[i];
        if (part.added || part.removed) {
            if (part.value.replace(/\s+/g, '') != '') { //string is not empty
                numLinesModified += part.count;
            }
        }
    }
    return numLinesModified;
  },
  reloadFile(isNew, error, success) {
    paranoid.get(this.url, (err, res, newData) => {
        if (err) return error(err);
        if (isNew) {
            return this.bulkWriteToBucket([{
                data: newData,
                key: this.getFilteredFileUrl()
            }, {
                data: this.extractRelativeUrls(newData).join('\n'),
                key: 'urls-' + this.getFilteredFileUrl()
            }], (err) => {
                console.log(err);
                return error(err);
            }, (newData) => {
                success({
                  modified: false,
                  data: newData
                });
            });
        }
        this.getRemoteContents((err) => {
            return error(err);
        }, (originalDataArray) => {
            let originalData = originalDataArray[0] //TODO: check for error here
            if (typeof originalData !== 'string') originalData = '';
            if (newData == originalData) { // file has not been modified, return
                console.log('File has not been modified.');
                return success({
                  modified: false,
                  data: originalData
                });
            }
            // file has been modified, diff the file

            let threshold = 0;
            let diff = jsdiff.diffLines(originalData, newData);
            let numLinesModified = this.numLinesModified(diff);

            let originalUrls = originalDataArray[2]; // location of the url file
            if (typeof originalUrls !== 'string') originalUrls = '';
            let newUrls = this.extractRelativeUrls(newData).join('\n')
            let urlsDiff = jsdiff.diffLines(originalUrls, newUrls);
            let numUrlLinesModified = this.numLinesModified(urlsDiff);
            if (numLinesModified > threshold) {
                console.log("Modifications made, saving files.");
                var filesToWrite = [{
                    data: newData,
                    key: this.getFilteredFileUrl()
                }, {
                    data: JSON.stringify(diff),
                    key: 'diff-' + this.getFilteredFileUrl()
                }];
                if (numUrlLinesModified > threshold) {
                  filesToWrite.push({
                    data: newUrls,
                    key: 'urls-' + this.getFilteredFileUrl()
                  }, {
                    data: JSON.stringify(urlsDiff),
                    key: 'urls-diff-' + this.getFilteredFileUrl()
                  });
                }
                this.bulkWriteToBucket(filesToWrite,(err) => {
                    return error(err);
                }, (response) => {
                    success({
                      file: this,
                      modified: true,
                      numLinesModified: numLinesModified,
                      numUrlLinesModified: numUrlLinesModified,
                      diff: diff,
                      urlsDiff: urlsDiff
                    });
                });
            }
        });
    });
  }
}

module.exports = mongoose.model('File', FileSchema);
