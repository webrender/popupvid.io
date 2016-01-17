var mongoose = require('mongoose');
module.exports = mongoose.model('Entry', {
    slug: {type : String},
    data: {type : String}
});
