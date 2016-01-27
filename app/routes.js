var Entry = require('./models/entry');
var shortId = require('shortid');
var request = require('request');

var authCheck = function(username, token) {
    request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token, function(error, response, body){
        if (!error && response.statusCode ==200){
            parsedBody = JSON.parse(body);
            if (body.email === username){
                return true;
            }
            return false;
        }
    });
};

module.exports = function(app) {

	// server routes
	// ===========================================================
	// handle things like api calls
	// authentication routes




    app.get('/api/load/:id', function(req, res) {
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

        console.log(authCheck(req.body.username, req.body.token));

    	var slug = shortId.generate();

    	var video = new Entry({
    		slug: slug,
            username: req.body.username,
            title: req.body.title,
            video: req.body.video,
            data: JSON.stringify(req.body.data)
    	});

    	video.save(function(err){
    		if (err) res.send(err);
    		res.send(slug);
    	});

    });

    app.post('/api/save/:id', function(req, res){

        console.log(res.body);

        var slug = req.params.id;

        var query = {slug: slug};
        //
        Entry.update({
            slug: slug
        }, {
            $set: {
                data: JSON.stringify(req.body)
            }
        }, function() {
            res.send(slug);
        });


    });

	// frontend routes
	// =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/dist/views/index.html');
	});

};
