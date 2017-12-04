var Subdomain = require('./Subdomain');
var paranoid = require("paranoid-request");
var mongoose = require('mongoose');
var fs = require('fs');
var jsdiff = require('diff');

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
    getLocalContents(error, success) {
        fs.readFile('files/' + this.getFilteredFileUrl(), 'utf8', (err,data) => {
          if (err) return error(err);
          this.extractRelativeUrls(data);
          success(data);
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
        return urls;
    },
    reloadFile(isNew, error, success) {
        paranoid.get(this.url, (err, res, newData) => {
            if (err) return error(err);
            if (isNew) {
                return fs.writeFile('files/' + this.getFilteredFileUrl(), newData, (err) => {
                    if (err) return error(err);
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
                console.log(diff)
                if (modifications.length && numCharsModified / originalData.length > threshold) {
                    console.log("Modifications made, saving files.");
                    fs.writeFile('files/' + this.getFilteredFileUrl(), newData, (err) => {
                        if (err) return error(err);
                        fs.writeFile('files/diff-' + this.getFilteredFileUrl(), JSON.stringify(diff), (err) => {
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
