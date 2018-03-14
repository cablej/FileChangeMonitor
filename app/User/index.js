var express = require('express');
var router = express.Router();

var auth = require('../auth/auth.service');
var User = require('./user.model');
var request = require('request');

const braintree = require('braintree');
const braintreeGateway = braintree.connect({
  environment: process.env.BRAINTREE_TYPE == 'production' ? braintree.Environment.Production
   : braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

function validationError(res, err) {
  res.status(422).json(err);
}

router.get('/braintree/clientToken', auth.ensureAuthenticated, braintreeClientToken);
router.post('/braintree/createSubscription', auth.ensureAuthenticated, function(req, res, next) {
  User.findById(req.user, function(err, user) {
    req.user = user;
    createBraintreeSubscription(req, res, next);
  });
});
router.post('/braintree/cancelSubscription', auth.ensureAuthenticated, function(req, res, next) {
  User.findById(req.user, function(err, user) {
    req.user = user;
    cancelBraintreeSubscription(req, res, next);
  });
});
router.post('/braintree/webhook', braintreeWebhook);

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


/**
 * Returns the braintree client token
 */
function braintreeClientToken(req, res, next) {
  braintreeGateway.clientToken.generate({}, (err, response) => {
    res.send(response.clientToken);
  });
}

/**
 * Creates a braintree subscription for the user
 */
function createBraintreeSubscription(req, res, next) {
  let nonce = req.body.payment_method_nonce;

  // update if already created
  if (req.user.braintree && req.user.braintree.customerId
    && req.user.braintree.customerId !== ''
    && (req.user.braintree.status == 'new' || req.user.braintree.status == 'Active')) {
    braintreeGateway.customer.update(req.user.braintree.customerId, {
      firstName: req.user.username,
      email: req.user.email,
      paymentMethodNonce: nonce
    }, (err, result) => {
      if (!err && result.success) {
        let token = result.customer.paymentMethods[0].token;

        braintreeGateway.subscription.update(req.user.braintree.subscriptionId, {
          paymentMethodToken: token
        }, (subErr, subResult) => {
          req.user.braintree.customerId = result.customer.id;
          req.user.braintree.subscriptionId = subResult.subscription.id;
          req.user.save();
          res.status(200).end();
        });
      }
    });
  } else { //otherwise, create a new account
    braintreeGateway.customer.create({
      firstName: req.user.username,
      email: req.user.email,
      paymentMethodNonce: nonce
    }, (err, result) => {
      if (!err && result.success) {
        let token = result.customer.paymentMethods[0].token;

        braintreeGateway.subscription.create({
          paymentMethodToken: token,
          planId: process.env.BRAINTREE_PLAN_ID
        }, (subErr, subResult) => {
          console.log(result);
          req.user.braintree = {
            customerId: result.customer.id,
            subscriptionId: subResult.subscription.id,
            subscriptionStatus: 'new',
            subscriptionStarted: subResult.subscription.createdAt
          };
          req.user.currentPlan = 'paid';

          req.user.save();
          res.status(200).end();
        });
      }
    });
  }
}

/**
 * Creates a braintree subscription for the user
 */
function cancelBraintreeSubscription(req, res, next) {
  if (req.user.braintree.subscriptionId) {
    braintreeGateway.subscription.cancel(req.user.braintree.subscriptionId, (err, result) => {
      if (!err) {
        req.user.braintree.subscriptionStatus = 'userCanceled';
        req.user.currentPlan = 'free';
        // TODO: insert logic to prevent user from going over domain limit
        req.user.save();
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    });
  } else {
    res.status(403).send();
  }
}

/**
 * The webhook for processing braintree requests
 */
function braintreeWebhook(req, res, next) {
  console.log(req.body)
  braintreeGateway.webhookNotification.parse(
    req.body.bt_signature,
    req.body.bt_payload,
    (err, webhookNotification) => {
      console.log(webhookNotification);
      if (webhookNotification && webhookNotification.subscription) {
        User.findOne({ 'braintree.subscriptionId': webhookNotification.subscription.id })
          .then(user => {
            user.braintree.subscriptionStatus = webhookNotification.subscription.status;
            user.save();
          });
      }
    }
  );
  res.status(200).send();
}

module.exports = router;