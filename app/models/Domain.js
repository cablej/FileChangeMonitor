let paranoid = require("paranoid-request");
let mongoose = require('mongoose');
var File = require('./File');
let jsdiff = require('diff');
let AWS = require('aws-sdk');
var Promise = require("bluebird");

const DomainSchema = new mongoose.Schema({
    name: { type : String, default: '', sparse: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

DomainSchema.pre('save', (next) => {
    next();
});

DomainSchema.path('name').validate((name) => {
  if (name === '') return false;
  return true;
}, 'The name is not valid.');

DomainSchema.methods = {
    // returns a promise for creating the new file
    addFile(url) {
      return new Promise((resolve, reject) => {
        File.create({
            url: url.url,
            dynamic: url.dynamic || false,
            baseUrl: url.baseUrl || '',
            baseDomain: url.baseDomain || '',
            user: this.user
        }, (err, file) => {
          this.files.push(file);
          if (err) return reject(err);
          file.reloadFile(true, reject, resolve);
        });
      });
    }
}

module.exports = mongoose.model('Domain', DomainSchema);
