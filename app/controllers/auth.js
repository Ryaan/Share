/**
 * Page to send user after successful facbook login
 */

exports.signin = function(req, res, next) {
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
}

exports.facebookCallback = function(req, res, next) {
    console.log("Auth Callback");
    res.redirect('/');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    console.log(req);
    res.send('Success');
};

/**
 * Session
 */
exports.session = function(req, res) {
    //res.redirect('/');
    console.log("Start session");
};

exports.isAuthenticated = function(req, res){
        console.log("called");
        res.jsonp(req.isAuthenticated());
}