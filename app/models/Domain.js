var Subdomain = require('./Subdomain');
var paranoid = require("paranoid-request");
var mongoose = require('mongoose');
var fs = require('fs');

const DomainSchema = new mongoose.Schema({
    name : { type : String, default: '', index: true, unique: true },
    url : { type : String, default: '' },
    subdomains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subdomain' }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

DomainSchema.pre('save', function(next) {
    next();
});

DomainSchema.path('name').validate(function(name) {
  if (name == '') return false;
  return true;
}, 'The name is not valid.');

DomainSchema.methods = {
    getFilteredFileUrl() {
        return this.id.replace(/\W/g, '');
    },
    fetchUrl(error, success) {
        paranoid.get(this.url, (err, res, body) => {
            if(err) {
                error(err);
                return;
            }
            fs.writeFile('files/' + this.getFilteredFileUrl(), body, (err) => {
                if(err) {
                    error(err);
                    return;
                }
                console.log("The file was saved!");
                success(body);
            });
        });
    }
}

module.exports = mongoose.model('Domain', DomainSchema);
