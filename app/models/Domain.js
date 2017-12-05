var Subdomain = require('./Subdomain');
var paranoid = require("paranoid-request");
var mongoose = require('mongoose');
var jsdiff = require('diff');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

const DomainSchema = new mongoose.Schema({
    name : { type : String, default: '', index: true, unique: true },
    url : { type : String, default: '' },
    subdomains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subdomain' }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

DomainSchema.pre('save', function(next) {
    next();
});

DomainSchema.path('name').validate(function(name) {
  if (name == '') return false;
  return true;
}, 'The name is not valid.');

DomainSchema.methods = {
    getFilteredFileUrl() {
        return this.id.replace(/\W/g, '');
    },
    // returns a promise of the contents of the locally stored file
    getLocalContents(error, success) {
        s3.getObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: this.getFilteredFileUrl(),
        }, (err, data) => {
            if (err) return error(err);
            success(data.Body.toString('utf-8'));
        });
    },
    // is this function name too long? maybe... but it does what it says it does
    // writes the file to the bucket and extracts urls, writes those to the bucket
    writeToBucketAndExtractRelativeUrls(data, err, success) {
        s3.putObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: this.getFilteredFileUrl(),
            Body: data
        }, (err, response) => {
            if (err) return error(err);
            let urls = this.extractRelativeUrls(data);
            s3.putObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: 'urls-' + this.getFilteredFileUrl(),
                Body: urls.join('\n')
            }, (err, data) => {
                if (err) return error(err);
                console.log("The file was saved!");
                success();
            });
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
        console.log(urls)
        return  Array.from(urls);
    },
    reloadFile(isNew, error, success) {
        paranoid.get(this.url, (err, res, newData) => {
            if (err) return error(err);
            if (isNew) {
                return this.writeToBucketAndExtractRelativeUrls(newData, (err) => {
                    return error(err);
                }, () => {
                    console.log("The file was saved!");
                    success(newData);
                });
            }
            this.getLocalContents((err) => {
                return error(err);
            }, (originalData) => {
                if (newData == originalData) { // file has not been modified, return
                    console.log('File has not been modified.');
                    return success(originalData);
                }
                // file has been modified, diff the file

                let threshold = 0;
                let diff = jsdiff.diffChars(originalData, newData);
                let modifications = [];
                let numCharsModified = 0;
                for (let i=0; i < diff.length; i++) {
                    let part = diff[i];
                    if (part.added || part.removed) {
                        if (part.value.replace(/\s+/g, '') != '') { //string is not empty
                            console.log('non-empty string: ' + part.value)
                            modifications.push(part);
                            numCharsModified += part.count;
                        }
                    }
                }

                if (modifications.length && numCharsModified / originalData.length > threshold) {
                    console.log("Modifications made, saving files.");
                    s3.putObject({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: this.getFilteredFileUrl(),
                        Body: newData
                    }, (err, data) => {
                        if (err) return error(err);
                        s3.putObject({
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: 'diff-' + this.getFilteredFileUrl(),
                            Body: JSON.stringify(diff)
                        }, (err, data) => {
                            if (err) return error(err);
                            console.log("The file was saved!");
                            success(newData);
                        });
                    });
                }
            });
        });
    }
}

module.exports = mongoose.model('Domain', DomainSchema);
