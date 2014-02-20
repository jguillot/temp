/*
 * user Ressource
 */
 var User = require('../models/user.js');
 var Client = require('../models/client.js');
 var helper = require('../helper');

 exports.list = function(req, res){
 	res.render('users',{ title: 'NodyCRM - Users'});
 };


// API
 exports.listjson = function(req, res){
 	var users = User.find().select('-password').lean().exec(function (err, users) {
 		if (err) console.log(users)
 		var clients = User.find().select('').lean().exec(function (err, users) {

 		});
 		Client.aggregate([
	 		{ $match : {active : true}},
 		    { $group: 
 		    	{ _id : {id:"$_user", stage : "$stage"}, num: { $sum : 1 }}
 		    }],
 		    // @todo : Optimization !!! O(n^2)!!!
	    	function(err, result){ 
	    		for (var i = 0 ; i < result.length ; i++) {
	    			for (var j = 0 ; j < users.length ; j++) {
	    				if (result[i]._id.id == users[j]._id) {
	    					if (result[i]._id.stage == 'Client') {
 								users[j].numClients = result[i].num;
					 		}
					 		else{
					 			users[j].numProspects = result[i].num;
					 		}
						}
					}
				}
				res.send(users);
			}
 		);
 	});
 };

 exports.detail = function(req, res){
 	var user = User.findById(req.params.id).lean().exec(function (err, user) {
 		if (err) console.log(user)
		
		res.send(user);
 	});
 };

  exports.me = function(req, res){
  	var response = {};
  	if (req.user && req.user._id) {
	  	var user = User.findById(req.user._id).lean().exec(function (err, user) {
	  		if (err)
	  			response.status = 'error';
	 		else
	 			response = user;
	 		res.send(response);
	  	});
  	}
  	else {
  		response.status = 'error';
  		res.send(response);
  	}
  };

 exports.new = function(req, res){
 	res.render('newuser');
 };

 exports.edit = function(req, res){
 	var data = req.body;
 	// if the user edited is admin it is impossible to change the status
 	if (req.user._id == req.params.id)
		delete data.active;
	
 	delete data._id;


 	// @todo : need to be optimized
 	// Now : 2 update for user and 1 update for clients
 	// Ideally : 1 get for user + 1 update for user + 1 update for clients
 	// Pb : Not able to get the user and do an update on multiple field without mappy each field

 	

 	// We update the user with the given data
 	User.findByIdAndUpdate(req.params.id, { $set: data}, function(err,user) {
 		if (err) {
 			res.send(400,{status:err.message}); return;
 		}
		else {
			// We get the user after update and build the field name and update again the user with it
			var name = helper.buildName(user.firstname,user.lastname);
			User.findByIdAndUpdate(req.params.id, {name: name}, function(err,user) {
				if (err) {
		 			res.send(400,{status:err.message}); return;
		 		}
		 		// We update the user_name field of each client associated with this user
				Client.update({ _user: user._id }, { 
				  $set: { _user_name: user.name }},function(err) {
				  	if (err) {
			 			res.send(400,{status:err.message}); return;
			 		}
				    res.send({status:'success'});
				  }
				);
			});
		}
 	});
 	// var user = User.findById(req.params.id,'firstname lastname name', function (err, user) {
 	// 	if (err) console.log(user)
		
		// user.update({ _id: req.params.id }, { $set: data}, function(err, user) {
		// 	console.log(data.firstname);
		// 	console.log(user.firstname);
		// 	user.save(function() {
		// 		console.log('callback save');
		// 		res.send({status:'success'});				
		// 	});
			
		// });	
 	// });
 	// // User.update({ _id: req.params.id }, { $set: data}, function(err) {
 	// 	var response = {};
 	// 	if (err) {
		// 	response.status = err.message;
		// 	res.send(400,response);
		// }
		// else {
		// 	// update the user name in all clients
		// 	// associated with this user
		// 	// @todo : maintain the list (or the total number)
		// 	// of all associated client within the user document
		// 	// in order to optimize this update
		// 	User.update({ _user: req.params.id }, { $set: {_user_name:name}}, function(err) {
		// 		if (err)
		// 			res.send(400,{status:err.message});
		// 		else {

		// 			res.send({status:'success'});
		// 		}
		// 	});	

			
		// }
 	// });
 };

exports.delete = function(req, res){
	User.remove({ _id: req.params.id } ,function(err) {
	var response = {};
	if (err) {
		response.status = err.message;
		res.send(400,response);
	}
	else {
		response.status = 'success';
		res.send('success');
	}
	});
};

 exports.create = function(req, res){
 	var user = new User(req.body);
 	user.save(function (err, user) {
		var response = {};
 		if (err) {
			response.status = err.message;
			res.send(400,response);
		}
		else {
			response.status = 'success';
			response.user = user;
			res.send(response);
		}
 	});
 };