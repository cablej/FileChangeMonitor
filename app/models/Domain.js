let Subdomain = require('./Subdomain');
let paranoid = require("paranoid-request");
let mongoose = require('mongoose');
let jsdiff = require('diff');
let AWS = require('aws-sdk');
let s3 = new AWS.S3();

const DomainSchema = new mongoose.Schema({
    name: { type : String, default: ''},
    url: { type : String, default: '' },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

DomainSchema.pre('save', (next) => {
    next();
});

DomainSchema.path('name').validate((name) => {
  if (name === '') return false;
  return true;
}, 'The name is not valid.');

DomainSchema.methods = {
    
}

module.exports = mongoose.model('Domain', DomainSchema);
