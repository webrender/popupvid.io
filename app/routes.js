var Entry = require('./models/entry');
var shortId = require('shortid');
var request = require('request');
var cookieParser = require('cookie-parser');

module.exports = function(app) {

	// server routes
	// ===========================================================
	// handle things like api calls
	// authentication routes


    app.use(cookieParser());

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

    // Check for valid token
    app.post('/api/save', function(req, res, next){
        if (req.body.token){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.token, function(error, response, body){
                if (!error && response.statusCode ==200){
                    parsedBody = JSON.parse(body);
                    if (parsedBody.email === req.body.username){
                        next();
                    } else {
                        res.send(403);
                    }
                } else {
                    res.send(500);
                }
            });
        } else {
            next();
        }
    });

    // Save new video
    app.post('/api/save', function(req, res){

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

    // Check for valid token
    app.post('/api/save/:id', function(req, res, next){
        if (req.body.username){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.token, function(error, response, body){
                if (!error && response.statusCode == 200){
                    parsedBody = JSON.parse(body);
                    if (parsedBody.email === req.body.username){
                        next();
                    } else {
                        res.send(403);
                    }
                } else {
                    res.send(500);
                }
            });
        } else {
            res.send(401);
        } 
    });

    // Check that logged in user is owner of video
    app.post('/api/save/:id', function(req, res, next){
        Entry.find({ 'slug': req.params.id }, function (err, docs) {
            if (docs[0]) {
                if (docs[0].username === req.body.username) {
                    next();
                } else {
                    res.send(403);
                }
            } else {
                res.send(404);
            }
        });
    });

    // Save existing video
    app.post('/api/save/:id', function(req, res){

        var slug = req.params.id;
        var query = {slug: slug};
        
        Entry.update({
            slug: slug
        }, {
            $set: {
                data: JSON.stringify(req.body.data),
                title: req.body.title
            }
        }, function() {
            res.send(slug);
        });


    });

    app.get('/e/:id', function(req, res, next){
        
        if (req.cookies.authToken){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.cookies.authToken, function(error, response, body){
                if (!error && response.statusCode == 200){
                    var parsedBody = JSON.parse(body);
                    Entry.find({ 'slug': req.params.id }, function (err, docs) {
                        if (docs[0]) {
                            if (docs[0].username === parsedBody.email) {
                                next();
                            } else {
                                res.redirect('/v/' + req.params.id);
                            }
                        } else {
                            res.redirect('/v/' + req.params.id);
                        }
                    });
                } else {
                    res.redirect('/v/' + req.params.id);
                }
            });
        } else {
            res.redirect('/v/' + req.params.id);
        }
    });

	// frontend routes
	// =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {

		res.sendfile('./public/dist/views/index.html');
	});

};
