var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore');

var MatchSchema = new Schema({
    sender: {
    	type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dateSent: {
    	type: Date,
    	default: Date.now(),
    },
    senderStatus: String,
    reciever: {
    	type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dateRecieved: Date,
    recieverStatus: {
    	type: String,
    	default: 'pending',
    },});

MatchSchema.path('senderStatus').validate(function(senderStatus) {
	console.log('Sender status: '+senderStatus);
	if(senderStatus !== 'yes' && senderStatus !== 'no')
		return false;
	else
		return true;
}, 'No status sent');

MatchSchema.methods.send = function(sender, reciever, accept){

}



 mongoose.model('Match', MatchSchema);