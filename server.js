/**
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    fs = require('fs'),
    passport = require('passport'),
    logger = require('mean-logger');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('./config/config'),
    auth = require('./config/middlewares/authorization'),
    mongoose = require('mongoose');

//Bootstrap db connection
var db = mongoose.connect(config.db);

//Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

//bootstrap passport config
require('./config/passport')(passport);

var app = express();

var sessionStore =  new mongoStore({
                        url: config.db,
                        collection: 'sessions'
                    })

//express settings
require('./config/express')(app, passport, sessionStore);

//Bootstrap routes
require('./config/routes')(app, passport, auth);

//Start the app by listening on <port>
var port = process.env.PORT || config.port;

var io = require('socket.io').listen(app.listen(port));

require('./config/socket')(io, sessionStore);

console.log('Express app started on port ' + port);

//Initializing logger
logger.init(app, passport, mongoose);

//expose app
exports = module.exports = app;
