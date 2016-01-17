var Entry = require('./models/entry');
var shortId = require('shortid');

module.exports = function(app) {

	// server routes
	// ===========================================================
	// handle things like api calls
	// authentication routes

    app.get('/d/:id', function(req, res) {
        // use mongoose to get all nerds in the database
        Entry.find({slug: req.params.id}, function(err, entries) {

            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(entries); // return all nerds in JSON format
        });
    });

    // save
    // save/:id
    // edit/:id
    // auth

    app.post('/api/save', function(req, res){

        console.log(req.body);

    	var slug = shortId.generate();

    	var test = new Entry({
    		slug: slug,
            data: JSON.stringify(req.body)
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
