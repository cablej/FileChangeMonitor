var Subdomain = require('./Subdomain');

// grab the mongoose module
var mongoose = require('mongoose');

const DomainSchema = new mongoose.Schema({
	name : { type : String, default: '', index: true, unique: true },
	subdomains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subdomain' }]
});

DomainSchema.path('name').validate(function(name) {
  if (name == '') return false;
  return true;
}, 'The name is not valid.');

module.exports = mongoose.model('Domain', DomainSchema);
