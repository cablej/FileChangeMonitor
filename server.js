// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var dotenv         = require('dotenv').config();
var lusca          = require('lusca');
var morgan         = require('morgan');
var errorhandler   = require('errorhandler');

// configuration ===========================================

var port = process.env.PORT || 3000; // set our port
mongoose.connect(process.env.MONGO_URI); // connect to our mongoDB database (commented out after you enter in your own credentials)
mongoose.connection.on('error', () => {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

if (process.env.NODE_ENV === 'production') {
  app.use(lusca({
    xframe: 'SAMEORIGIN',
    hsts: {
      maxAge: 31536000, //1 year, in seconds
      includeSubDomains: true,
      preload: true,
    },
    xssProtection: true,
  }));
}

/**
 * Development Settings
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(errorhandler());
}

/**
 * Production Settings
 */
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port, () => {
  console.log('Express server listening on port %d.', port);
});
exports = module.exports = app; 						// expose app