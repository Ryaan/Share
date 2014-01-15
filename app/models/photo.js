/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    authTypes = ['twitter', 'facebook'];


/**
* Profile Photo Schema
*/

var PhotoSchema = new Schema({
    added: {
        type: Date,
        default: Date.now
    },
    likes: [{
    	date: {
    		type: Date,
    		default: Date.now(),
    	},
    	_id: {
    		type: Schema.Types.ObjectId,
        	ref: 'User'
    	}
    }]
});

PhotoSchema.methods.like = function(user){
    this.likes.push({_id: user});
    this.save();
}

PhotoSchema.methods.unlike = function(user){
    this.likes.pull(user);
    this.save();
}

mongoose.model('Photo', PhotoSchema);