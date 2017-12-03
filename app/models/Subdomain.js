var File = require('./File');

// grab the mongoose module
var mongoose = require('mongoose');

const SubdomainSchema = new mongoose.Schema({
	name : { type : String, default: '', index: true, unique: true },
	ports: [Object],
	directories: [Object],
	files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

SubdomainSchema.path('name').validate(function(name) {
  if (name == '') return false;
  return true;
}, 'The name is not valid.');

module.exports = mongoose.model('Subdomain', SubdomainSchema);
