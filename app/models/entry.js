var mongoose = require('mongoose');
module.exports = mongoose.model('Entry', {
    slug:       {type : String},
    video:      {type : String},
    username:   {type : String},
    title:      {type : String},
    data:       {type : String}
});
