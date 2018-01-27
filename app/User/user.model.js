var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var validator = require('validator');

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true, lowercase: true },
  email: { type: String, lowercase: true },
  password: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordTokenExpiration: { type: Date, select: false }
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

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
