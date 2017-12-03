var Domain = require('./models/Domain');
var File = require('./models/File');
var Subdomain = require('./models/Subdomain');

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	app.get('/api/domains', function(req, res) {
	  Domain.find((err, response) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	      res.status(200).json(response);
	    });
	});

	app.post('/api/domains', function(req, res) {
	  Domain.create(req.body, (err, response) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			if (err.name == 'ValidationError') {
	  				return res.status(422).json(err);
	  			}
	  			return res.status(500).send();
	  		}
	      res.status(200).json(response);
	    });
	});

	app.get('/api/domains/:id', function(req, res) {
	  Domain.findOne({ _id: req.params.id }, (err, response) => {
	  		if (err) {
	  			console.log('Error: ' + err);
	  			return res.status(500).send();
	  		}
	      res.status(200).json(response);
	    });
	});

	app.delete('/api/domains/:id', function(req, res) {
		Domain.findOne({ _id: req.params.id }, (err, domain) => {
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

	app.post('/api/domains/:id/findSubdomains', function(req, res) {
		// Run Sublist3r, save results as subdomains
	});

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};