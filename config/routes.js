var async = require('async');

module.exports = function(app, passport, authorize) {
    var auth = require('../app/controllers/auth');
    var users = require('../app/controllers/users');
    var photos = require('../app/controllers/photos');
    var matches = require('../app/controllers/matches');

    // Session Routes
    app.post('/api/auth/login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { 
                return res.jsonp(info, 401);
            }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.jsonp(req.user);
            });
        })(req, res, next);
    });

    //Setting the facebook oauth routes
    app.get('/api/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me', 'user_photos', 'read_friendlists', 'user_birthday'],
        failureRedirect: '/'
    }), auth.signin);

    app.get('/api/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/'
    }), auth.facebookCallback);

    app.get('/api/auth/signout', auth.signout);
    app.get('/api/auth/isauthd', auth.isAuthenticated);

    //Setting up the users api
    app.get('/api/users', users.all);
    app.get('/api/users/fb', authorize.blockGuest, users.fb);
    app.get('/api/users/:userId', authorize.blockGuest, users.show, users.me);
    app.post('/api/users/create', users.create);
    app.post('/api/users/:userId/update', authorize.blockGuest, users.update);
    app.post('/api/users/:userId/delete', authorize.blockGuest, users.delete);

    // Setting up the photo routes
    app.get('/api/users/:userId/photos', photos.all);
    app.get('/api/users/:userId/photos/:photoId', photos.show);
    app.get('/api/users/:userId/photos/:photoId/view', photos.view);
    app.post('/api/users/:userId/photos/create', authorize.blockGuest, photos.create);
    app.post('/api/users/:userId/photos/:photoId/update', photos.update);
    app.post('/api/users/:userId/photos/update_all', photos.updateAll);
    app.post('/api/users/:userId/photos/:photoId/delete', photos.delete);
    app.post('/api/users/:userId/photos/:photoId/like', photos.like);

    // Matches
    app.post('/api/users/:userId/match', authorize.blockGuest, matches.match);
    app.get('/api/matches', authorize.blockGuest, matches.all);
    app.get('/api/matches/next', authorize.blockGuest, matches.next);

    app.get('/api/matches/dist', authorize.blockGuest, matches.getDistance);

    //Finish with setting up the params
    app.param('userId', users.user);

    app.param('photoId', photos.photo);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};