var Entry = require('./models/entry');
var User = require('./models/user');
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
        Entry.find({slug: req.params.id}, function(err, entries) {
            if (err)
                res.send(err);
            if (entries[0]){
                if (entries[0].googleId != 'Anonymous'){
                    User.find({googleId: entries[0].googleId}, function(err2, entries2) {
                        if (err) {
                            res.send(500);
                        } else {
                            var response = entries[0];
                            response.username = entries2[0].username;
                            res.json([{
                                "username": entries2[0].username,
                                "title": entries[0].title,
                                "video": entries[0].video,
                                "data": entries[0].data,
                            }]);
                        }
                    });
                } else {
                    res.json([{
                        "username": 'Anonymous',
                        "title": entries[0].title,
                        "video": entries[0].video,
                        "data": entries[0].data,
                    }]);
                }
            } else {
                res.send(404);
            }
        });
    });


    // api/username ALL should check for token cookie and use it to verify googleId
    // api/username GET should return username if one exists
    // api/username POST should set a username if it's available, otherwise return an error

    app.all('/api/username', function(req, res, next) {
        if (req.cookies.authToken) {
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.cookies.authToken, function(error, response, body){
                if (!error && response.statusCode == 200){
                    var parsedBody = JSON.parse(body);
                    req.verifiedGoogleId = parsedBody.email;
                    next();
                } else {
                    res.send(500);
                }
            });
        } else {
            res.send(403);
        }
    });

    app.get('/api/username', function(req, res, next) {
        User.find({googleId: req.verifiedGoogleId}, function(err, entries){
            if (err) {
                res.send(500);
            } else {
                if (entries[0] && entries[0].username) {
                    res.send(entries[0].username);
                } else {
                    res.send('');
                }
            }
        });
    });

    app.post('/api/username', function(req, res, next) {
        User.find({username: req.body.username}, function(err, entries){
            if (err) {
                res.send(500);
            } else {
                if (entries[0] && entries[0].username) {
                    res.json({
                        'error': 'Sorry, this username is already taken.'
                    });
                } else {
                    var newUser = new User({
                        username: req.body.username,
                        googleId: req.verifiedGoogleId
                    });

                    newUser.save(function(err){
                        if (err) {
                            res.send(err);
                        } else {
                            res.send(200);
                        }
                    });
                }
            }
        });
    });

    // Check for valid token
    app.post('/api/save', function(req, res, next){
        if (req.body.token){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.token, function(error, response, body){
                if (!error && response.statusCode ==200){
                    parsedBody = JSON.parse(body);
                    if (parsedBody.email === req.body.googleId){
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
            googleId: req.body.googleId,
            title: req.body.title,
            video: req.body.video,
            origTitle: req.body.origTitle,
            data: JSON.stringify(req.body.data),
            created: Date.now()
    	});

    	video.save(function(err){
    		if (err) res.send(err);
    		res.send(slug);
    	});

    });

    // Check for valid token
    app.post('/api/save/:id', function(req, res, next){
        if (req.body.googleId){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.token, function(error, response, body){
                if (!error && response.statusCode == 200){
                    parsedBody = JSON.parse(body);
                    if (parsedBody.email === req.body.googleId){
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
                if (docs[0].googleId === req.body.googleId) {
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
                title: req.body.title,
                modified: Date.now()
            }
        }, function() {
            res.send(slug);
        });


    });

    // Redirect edit page to view if it's not the auth'd user
    app.get('/e/:id', function(req, res, next){

        if (req.cookies.authToken){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.cookies.authToken, function(error, response, body){
                if (!error && response.statusCode == 200){
                    var parsedBody = JSON.parse(body);
                    Entry.find({ 'slug': req.params.id }, function (err, docs) {
                        if (docs[0]) {
                            if (docs[0].googleId === parsedBody.email) {
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

    app.get('/api/u/:username', function(req, res, next){


        User.find({username: req.params.username}, function(err, users){
            if (err) {
                res.send(500);
            } else {
                if (users[0] && users[0].googleId) {
                    Entry.find({googleId: users[0].googleId}, 'slug video title origTitle created', function(err, entries) {
                        //return video info array
                        res.send(entries);
                    });
                    // res.send(entries[0].username);
                } else {
                    res.send('');
                }
            }
        });

    });

    // Check for valid token
    app.post('/api/delete/:video', function(req, res, next){
        if (req.body.googleId){
            request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + req.body.token, function(error, response, body){
                if (!error && response.statusCode == 200){
                    parsedBody = JSON.parse(body);
                    if (parsedBody.email === req.body.googleId){
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
    app.post('/api/delete/:video', function(req, res, next){
        Entry.find({ 'slug': req.params.video }, function (err, docs) {
            if (docs[0]) {
                if (docs[0].googleId === req.body.googleId) {
                    next();
                } else {
                    res.send(403);
                }
            } else {
                res.send(404);
            }
        });
    });

    // Delete entry
    app.get('/api/delete/:video', function(req, res, next){
        Entry.remove({'slug': req.params.video}, function(err, videos){
            if (err)
                res.send(500);
            res.send(200);
        });
    });

	// frontend routes
	// =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {

		res.sendfile('./public/dist/views/index.html');
	});

};
