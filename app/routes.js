var Domain = require('./models/Domain');
var File = require('./models/File');
let paranoid = require("paranoid-request");
var auth = require('./auth/auth.service');
var fs = require('fs');
var helperMethods = require('./helperMethods');
var Promise = require("bluebird");

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
        console.log(err);
        if (err) return res.status(500).send();
        urls = helperMethods.extractUrls(req.body.url, data, 'script', 'src=', '.js');
        res.status(200).json(urls);
    });
  });

  app.post('/api/domains', auth.ensureAuthenticated, function(req, res) {
    Domain.create({
      name: req.body.name,
      user: req.user
    }, (err, domain) => {
        var files = [];
        for (url of req.body.urls) {
          files.push(domain.addFile(url));
        }
        Promise.all(files).then(() => {
          domain.save();
          res.status(200).json(domain);
        }).catch((err) => {
          console.log('Error: ' + err);
          return res.status(500).send();
        });
      });
  });

  app.post('/api/domains/:id', auth.ensureAuthenticated, function(req, res) {
    Domain.findOne({ _id: req.params.id, user: req.user }, (err, domain) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        domain.name = req.body.name;
        domain.save();
        res.status(200).json(domain);
      });
  });

  app.get('/api/domains/:id', auth.ensureAuthenticated, function(req, res) {
    Domain.findOne({ _id: req.params.id, user: req.user })
      .populate('files')
      .exec((err, response) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        res.status(200).json(response);
      });
  });

  app.post('/api/files/:id', auth.ensureAuthenticated, function(req, res) {
    File.findOne({ _id: req.params.id, user: req.user }, (err, file) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        file.url = req.body.url;
        file.pollTime = req.body.pollTime || 3600;
        file.notifyThreshold = req.body.notifyThreshold || 0;
        file.notifyThresholdUnit = req.body.notifyThresholdUnit || 'urls';
        file.save();
        res.status(200).json(file);
      });
  });

  app.get('/api/files/:id', auth.ensureAuthenticated, function(req, res) {
    File.findOne({ _id: req.params.id, user: req.user }, (err, response) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        res.status(200).json(response);
      });
  });

  app.get('/api/files/:id/fileContents', auth.ensureAuthenticated, function(req, res) {
    File.findOne({ _id: req.params.id, user: req.user }, (err, file) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        file.getRemoteContents((err) => {
          console.log('Error: ' + err);
          return res.status(500).send();
        }, (data) => {
            res.status(200).json({ 'data': data });
        });
      });
  });

  app.post('/api/files/:id/reloadFile', auth.ensureAuthenticated, function(req, res) {
    File.findOne({ _id: req.params.id, user: req.user }, (err, file) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        file.reloadFile(false, (err) => {
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

  app.delete('/api/files/:id', auth.ensureAuthenticated, function(req, res) {
    File.findOne({ _id: req.params.id, user: req.user }, (err, file) => {
        if (err) {
          console.log('Error: ' + err);
          return res.status(500).send();
        }
        file.remove((err, response) => {
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