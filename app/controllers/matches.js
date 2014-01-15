var _ = require('underscore'),
    mongoose = require('mongoose'),
    Photo = mongoose.model('Match'),
    User = mongoose.model('User'),
    Match = mongoose.model('Match');


/*exports.send= function(req, res) {
	var match = new Match();
	match.sender = req.user;
	match.reciever = req.profile;
	match.senderStatus = req.body.status;
	match.save(function(err){
		if(err) return res.send(err);
	});
}

exports.recieve = function(req, res) {
	Match.findOne({ $or: [ { sender: req.user }, { reciever: req.profile } ],  $or: [ { sender: req.user }, { reciever: req.profile } ]}, );
}
*/

exports.match = function(req, res){
	//console.log(req.body);
	Match.findOne({ sender: req.user, reciever:req.profile }, function(err, match){
		if(!match){
			Match.findOne({ sender: req.profile, reciever:req.user }, function(err, match){
				if(!match){
					new Match({
						sender: req.user,
						senderStatus: req.body.status,
						reciever: req.profile,
					}).save(function(err){
						if(err) return res.send(err);
						res.send('Created match');
					});
				}else{
					match.recieverStatus = req.body.status;
					match.dateRecieved = new Date();
					match.save();
					if(match.senderStatus == 'yes' && match.recieverStatus == 'yes'){
						res.send('Match made');
					}else{
						res.send('Match never to be');
					}
				}
			});
		}else{
			return res.send('Error - match previosuly sent');
		}
	});
}

exports.getDistance = function(req, res){
	var query = User.collection.geoNear(
  	req.user.location[0],
    req.user.location[1],
      { maxDistance: 100000/(6371 * Math.PI / 180.0)}, function (error, docs) {
      	docs = docs.results;
    	//console.log("RESULTS - "+JSON.stringify(docs));
    	//docs.results.dis = 6371 * Math.PI / 180.0*docs.results.dis;

    	_.each(docs, function(item, i){
    		item.dis = 6371 * Math.PI / 180.0*item.dis;
    		console.log("summ'd");
    	});
		//docs.find({dis:0}).exec(function(newdocs){
		return res.jsonp(docs);
		//});

    });
}

exports.all = function(req, res){
	Match.find({senderStatus: 'yes', recieverStatus: 'yes', $or :[{sender: req.user}, {reciever: req.user}]}, function(err, docs){
		res.jsonp(docs);
		//docs.
	});
}

exports.next = function(req, res){
	// User.aggregate({$project: {username: 1, email: 1}}, function(err, docs){
	// 	res.jsonp(docs);
	// });

	Match.find({$or: [
		{sender: req.user.id}, 
		{reciever: req.user.id, recieverStatus:{$ne : 'pending'}}
		]})
	.select('sender reciever')
	.exec()
	.then(function(docs){
		senders = _.pluck(docs, 'sender');
		//res.jsonp(senders);
		recievers = _.pluck(docs, 'reciever');
		return User.find().nin('_id', senders.concat(recievers)).exec();
	})
	.then(function(user){
		res.jsonp(user);
	});

}