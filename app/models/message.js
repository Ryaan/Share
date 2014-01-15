var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore');

var MessageSchema = new Schema({
	from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    message: String,
    sent: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Message', MessageSchema);