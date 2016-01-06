var Entry = require('./models/entry');
var shortId = require('shortid');

module.exports = function(app) {

	// server routes
	// ===========================================================
	// handle things like api calls
	// authentication routes

	app.get('/api/test', function(req, res) {
        // use mongoose to get all nerds in the database
        Entry.find(function(err, entries) {

            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(entries); // return all nerds in JSON format
        });
    });

    app.get('/api/testsave', function(req, res){

    	var slug = shortId.generate();

    	var test = new Entry({
    		slug: slug
    	});

    	test.save(function(err){
    		if (err) res.send(err);
    		res.send('saved. id: ' + slug);
    	});

    });

	// frontend routes
	// =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/views/index.html');
	});

};
