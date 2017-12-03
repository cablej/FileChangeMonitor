// grab the mongoose module
var mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
	name: String,
	url: String,
	fileName: String
});

FileSchema.path('name').validate(function(name) {
  if (name == '') return false;
  return true;
}, 'The name is not valid.');

module.exports = mongoose.model('File', FileSchema);
