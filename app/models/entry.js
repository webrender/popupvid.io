var mongoose = require('mongoose');
module.exports = mongoose.model('Entry', {
    slug:       {type : String},
    video:      {type : String},
    googleId:   {type : String},
    title:      {type : String},
    origTitle:  {type : String},
    data:       {type : String},
    created:    {type : Date},
    modified:   {type : Date}
});
