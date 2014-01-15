 var request = require('request'),
    _ = require('underscore');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            console.log("exports.user set");
            next();
        });
};

exports.all = function(req, res) {
    User.find({}, function (err, users) {
        console.log('Age: '+req.user.age());
        res.json(users);
   });
}

/**
 *  Show profile
 */
exports.show = function(req, res, next) {
    if(req.profile.id == req.user.id){
        return next();
    }
    console.log("Not session's profile - displaying public profile " + JSON.stringify(req.profile.id) +" "+JSON.stringify(req.user.id));
    var user = req.profile;

    res.jsonp({
        title: user.name,
        user: user
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    console.log('Users own profile (isAuthorized() == true)'+req.user);
    res.jsonp(req.user || null);
};

exports.fb = function(req, res) {
    // console.log(req);
    if(!req.user.token){
        return res.send("User did not use fb", 500);
    }
    accessToken = req.user.token;
    profile = req.user.facebook;

    console.log("User login: "+accessToken+" "+JSON.stringify(profile.id)); 
    request('https://graph.facebook.com/me/albums?access_token='+accessToken, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Loop through albums
            _.each(JSON.parse(body).data, function(album){
                if(album['name'] === 'Profile Pictures'){
                    // Profile photos found, get photo data
                    console.log('Album id: '+album['id']);
                    request('https://graph.facebook.com/'+album['id']+'/photos?access_token='+accessToken, function (error, response, body) {
                        console.log(JSON.parse(body).data[0].images[2].source);
                        res.jsonp(_.map(JSON.parse(body).data, function(photo){ 
                            // Return just id and photo url
                            console.log('Photos: '+photo.images);
                            return {
                                id: photo.id,
                                photo: photo.images[0].source
                            }
                        }));
                    });
                }
                //console.log(album);
            });
        }   
    });
};

/**
 * Create user
 */
exports.create = function(req, res) {
    var user = new User(req.body);
    console.log(req.body);
    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            return res.jsonp({
                errors: err.errors,
                user: user
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

exports.update = function(req, res) {
    User.findByIdAndUpdate(
        req.profile.id, 
        req.body, 
        {multi: false},
        function(err, user) {
            res.send('Updated User '+user)
        });
}

exports.delete = function(req, res) {
    User.remove({_id: req.profile.id}, function(err){
        if(err) return res.send("Error deleting: "+err);
        res.send('Successfully Deleted');
    });
}