var express = require('express'),
    connect = require('express/node_modules/connect'),
    passportSocketIo = require("passport.socketio"),
    util = require('util');

	//cookie = require('cookie'),
    //parseCookie = cookie.parse;

var online = {};

module.exports = function(io, sessionStore){

		// set authorization for socket.io
	io.set('authorization', passportSocketIo.authorize({
	  cookieParser: express.cookieParser,
	  key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
	  secret:      'MEAN',              // the session_secret to parse the cookie
	  store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
	  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
	  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
	}));

	function onAuthorizeSuccess(data, accept){
	  //console.log('successful connection to socket.io - '+JSON.stringify(data));


	  // The accept-callback still allows us to decide whether to
	  // accept the connection or not.
	  accept(null, true);
	}

	function onAuthorizeFail(data, message, error, accept){
	  //if(critical)
	    //throw new Error(message);
	  console.log('failed connection to socket.io:', message);

	  // We use this callback to log all of our failed connections.
	  accept(null, false);
	}

	io.sockets.on('connection', function(socket){
		if(socket.handshake.user.id in online){

		}else{
			online[socket.handshake.user.id] = socket;
			//console.log('Users currently online: '+util.inspect(online, false, null));
		}
		console.log("Opened connection"+JSON.stringify(Object.keys(online)));
		socket.emit('welcome',{message: 'hello'});
		// socket.on('private', function(data) {        
	 //        io.sockets.sockets[data.to].emit("private", { from: socket.id, to: data.to, msg: data.msg });
	 //   		socket.emit('private', { from: socket.id, to: data.to, msg: data.msg });
	 //   	});

		socket.on('message', function(data, callback){
			console.log('Sending message to '+data.to+' From '+data.from);
			if(data.to in online){
				online[data.to].emit('message', {from: data.from, message: data.message});
				//console.log('User online - message: '+data.message);
			}else{
				// store in database
				console.log('Added message to db '+util.inspect(data, false, null));
				online[data.from].emit('message', {from: data.from, message: data.message});
			}
		});

		socket.on('disconnect', function() {
      		console.log('Got disconnect!');

      		//var i = online.indexOf(socket);
      		delete online[socket.handshake.user.id];
   		});
	});
}