/**
 * Module dependencies.
 */
var request = require('request'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    Photo = mongoose.model('Photo'),
    User = mongoose.model('User'),
    path = require('path'),
    fs = require('fs'),
    config = require('../../config/config'),
    easyimg = require('easyimage'),
    q = require('q');


var small = 200, 
    medium = 400;

var updateOrders = function(req){
    _.each(req.body, function(element, index, list){
        req.profile.photos.id(element._id).order = index;
        req.profile.save();
        console.log("Element: "+JSON.stringify(req.profile.photos));
    })
}

var createThumb = function(width, height, path, extension){
    var deferred = q.defer();
    console.log("Creating thumb: "+path+extension);
    easyimg.thumbnail({
        src:path+extension, dst:path+'-thumb-'+width+'-'+height+extension,
        width:width, height:height,
        x:0, y:0
    },
    function(err){
        if(err) console.log(err);
        return deferred.resolve();
    });
    return deferred.promise;
}

/**
 * Find user by id
 */
exports.photo = function(req, res, next, id) {
    console.log("Calling photo");
    Photo
        .findOne({
            _id: id
        })
        .exec(function(err, photo) {
            if (err) return next(err);
            if (!photo) return next(new Error('Failed to load Photo ' + id));
            req.photo = photo;
            console.log("Photo: "+req.photo);
            next();
        });
};

exports.like = function(req, res){
    Photo.findOne({_id: req.photo.id}).exec(function(err, photo){
        if(!photo){
            return res.send("Photo does not exist");
        }

        if(!photo.likes.id(req.user)){
            photo.like(req.user);
            res.send("Liked photo");
        }else{
            photo.unlike(req.user);
            res.send("Unliked photo");
        }
    })
}

exports.all = function(req, res){
    console.log("Returning all photos for user");
    console.log(JSON.stringify(req.profile));
        //.populate();
    User.populate(req.profile, {path: 'photos._id'}, function (err, user) {
        res.jsonp(req.profile.photos);
    })
}


exports.show = function(req, res){
    Photo.find({_id: req.photo.id, user: req.profile}, function (err, photo) {
        res.json(photo);
   });
};


exports.view = function(req, res){
    res.sendfile('/img/user/' + req.profile + '/' + req.photo.id +'.png');
}


exports.create = function(req, res){
    //console.log(req);
    console.log(req.body);
    var photo = new Photo(req.body);
    var dest = config.root + '/public/img/user/'+photo.id;

     var writePhoto = function(){
         var deferred = q.defer();
        if(!req.body.facebook){
            var file = req.files.image;
            if(!file){
                return res.send("No files attched");
            }
            var extension = path.extname(file.name).toLowerCase();
            
            // Get uploaded image and crop    
            if(extension !== '.jpg' && extension !== '.jpeg' && extension !== '.png'){
                res.send("Image type must be either jpeg or png.");
            }else{
                fs.readFile(file.path, function(err, data) {
                    fs.writeFile(dest+extension, data, function(err) {
                        createThumb(small, small, dest, extension).then(deferred.resolve);
                    });
                });
            }
        }else{
            //var postURL = req.protocol + "://" + req.get('host') + req.url;
            console.log("Calling request");
            extension = path.extname(req.body.facebook).toLowerCase();
            console.log(extension);
            var r = request(req.body.facebook).pipe(fs.createWriteStream(dest+extension));
            r.on('finish', function () {
                createThumb(small, small, dest, extension).then(deferred.resolve);
            });
            //request.get('http://i.msdn.microsoft.com/dynimg/IC626253.png').pipe(request.post('http://localhost:3000/api/users/5288d54c3426b84622000001/photos/create'));
        }
         return deferred.promise;
     }

     writePhoto().then(function(){
            photo.save(function(err){
           if(err) return res.send(err);
        });
        User.update({_id: req.profile.id},
            {
                $push: {
                    photos: {
                        _id: mongoose.Types.ObjectId(photo.id),
                        order: req.profile.photos.length
                    }
                }
            },
            {upsert:true},
            function(err){
            if(err){
                    console.log(err);
            }else{
                    console.log("Successfully added");
            }
            return res.send("Added photo for "+req.profile.id);
         });
    });
}

exports.update = function(req, res){
    Photo.update({user:req.profile, photo:req.photo},req.body, {upsert:true}, function(err){
        if(err) return res.send(err);
        return res.send("Updated photo "+req.photo.id);
    })
}

/**
* NOTE THAT ORDERS MUST BE UNIQUE
*/

exports.updateAll = function(req, res){
    updateOrders(req);
    res.send("Updated");
    //var orders = [];
    /*Photo.find({user:req.profile.id},function(err,photos){ 
        if(err) return res.send(err);
        photos.forEach(function(elem, index, array) {
            if(elem.id == req.body[index].id && !_.contains(order, req.body[index].order)){
                elem = req.body[index];
                elem.order = index;
                elem.save();
                //_.union(orders, [req.body[index].order]);
            }else{
                res.send("Error updating");
            }

        });
    });*/
    return res.send("Updated ");
}

exports.delete = function(req, res){
    console.log("Photo to delete: "+req.photo);
    Photo.remove({_id: req.photo.id}, function(err){
        if(err) return res.send("Error deleting: "+err);
        req.profile.photos.pull(req.photo.id);
        req.profile.save();
        console.log(req.profile.photos);
        req.body = req.profile.photos;
        console.log(req.profile);
        updateOrders(req);
        res.send("Deleted");
    });    

}



