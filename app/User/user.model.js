var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var validator = require('validator');
var File = require('../models/File');
var Promise = require("bluebird");

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true, lowercase: true },
  email: { type: String, lowercase: true, unique: true },
  password: { type: String, select: false },
  numFiles: { type: Number, default: 0 },
  maximumFiles: { type: Number, default: process.env.FREE_FILE_LIMIT },
  currentPlan: { type: String, default: 'free'},
  resetPasswordToken: { type: String, select: false },
  resetPasswordTokenExpiration: { type: Date, select: false },
  braintree: {
    customerId: String,
    subscriptionId: String,
    subscriptionStatus: String,
    subscriptionStarted: String
  }
});

userSchema.path('username').validate((username) => {
  if (username === '') return false;
  return true;
}, 'The username is not valid.');

userSchema.path('email').validate((email) => {
  return validator.isEmail(email);
}, 'The email is not valid.');

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(12, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods = {
  comparePassword(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
      done(err, isMatch);
    });
  },
  updateFileCount() {
    return new Promise((resolve, reject) => {
      File.count({
          user: this._id
      }, (err, numFiles) => {
        if (err) return reject(err);
        this.numFiles = numFiles;
        this.save();
        resolve(this);
      });
    });
  }
}

module.exports = mongoose.model('User', userSchema);
