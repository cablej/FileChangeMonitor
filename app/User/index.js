var express = require('express');
var router = express.Router();

var auth = require('../auth/auth.service');
var User = require('./user.model');
var request = require('request');

function validationError(res, err) {
  res.status(422).json(err);
}

/*
* Return a user's own profile
* */
router.get('/me', auth.ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
* Change profile fields (including password)
* */
router.put('/me', auth.ensureAuthenticated, function(req, res) {
  var oldPass = req.body.oldPassword ? String(req.body.oldPassword) : null;
  var newPass = req.body.newPassword ? String(req.body.newPassword) : null;
  User.findById(req.user, '+password', function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    if (newPass) {
      user.comparePassword(oldPass, function(err, isMatch) {
        console.log(arguments);
        if (!isMatch) {
          return res.status(401).send({ message: 'Old password is required to update password.' });
        }
        user.password = newPass;
        user.save(function(err) {
          if (err) {
            validationError(res, err);
          }
          res.status(200).end();
        });
      });
    }
    // Users with local authentication require password.
    else if (user.providers.indexOf('local') !== -1) {
      user.save(function(err) {
        if (err) {
          validationError(res, err);
        }
        res.status(200).end();
      });
    } else {
      if (newPass) {
        user.providers.push('local');
      }
      user.save(function(err) {
        if (err) {
          validationError(res, err);
        }
        res.status(200).end();
      });
    }
  });
});

module.exports = router;