var Domain = require('./models/Domain');
var File = require('./models/File');
let paranoid = require("paranoid-request");
var Subdomain = require('./models/Subdomain');
var auth = require('./auth/auth.service');
var fs = require('fs');
var helperMethods = require('./helperMethods');

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	app.use('/auth', require('./auth'));
	app.use('/user', require('./User'));

	app.get('/api/domains', auth.ensureAuthenticated, function(req, res) {
	  Domain.find({ user: req.user }, (err, response) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	      res.status(200).json(response);
	    });
	});

	app.post('/api/domains/previewJSUrls', auth.ensureAuthenticated, function(req, res) {
	  paranoid.get(req.body.url, (err, newRes, data) => {
        if (err) return error(err);
        urls = helperMethods.extractUrls(req.body.url, data, 'script', 'src=', '.js');
	      res.status(200).json(urls);
	  });
	});

	app.post('/api/domains', auth.ensureAuthenticated, function(req, res) {
	  req.body.user = req.user;
	  Domain.create(req.body, (err, domain) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			if (err.name == 'ValidationError') {
	  				return res.status(422).json(err);
	  			}
	  			return res.status(500).send();
	  		}
	  		domain.reloadFile(true, (err) => {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}, (data) => {
		      res.status(200).json(domain);
	  		})
	    });
	});

	app.get('/api/domains/:id', auth.ensureAuthenticated, function(req, res) {
	  Domain.findOne({ _id: req.params.id, user: req.user }, (err, response) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	      res.status(200).json(response);
	    });
	});

	app.get('/api/domains/:id/fileContents', auth.ensureAuthenticated, function(req, res) {
	  Domain.findOne({ _id: req.params.id, user: req.user }, (err, domain) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	  		domain.getLocalContents((err) => {
  				console.log('Error: ' + err);
  				return res.status(500).send();
	  		}, (data) => {
		        res.status(200).json({ 'data': data });
	  		});
	    });
	});

	app.post('/api/domains/:id/reloadFile', auth.ensureAuthenticated, function(req, res) {
	  Domain.findOne({ _id: req.params.id, user: req.user }, (err, domain) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	  		domain.reloadFile(false, (err) => {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}, (data) => {
		      res.status(200).json({ 'data': data });
	  		})
	    });
	});

	app.delete('/api/domains/:id', auth.ensureAuthenticated, function(req, res) {
		Domain.findOne({ _id: req.params.id, user: req.user }, (err, domain) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	  		domain.remove((err, response) => {
	  			if (err) {
		  			console.log('Error: ' + err);
		  			return res.status(500).send();
	  			}
          res.status(204).end();
        });
	    });
	});

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};