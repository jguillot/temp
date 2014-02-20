/*
 * Client Ressource
 */
 var Client = require('../models/client.js');
 var User = require('../models/user.js');
 // var __ = require('underscore');
 exports.list = function(req, res){
 	res.render('clients',{ title: 'NodyCRM - Clients'});
 };

 
// API
 exports.listjson = function(req, res){
 	if (req.query.count) {
 		Client.count(function (err, count) {
	  		if (err) console.log('error')
	 		
	 		var response = {count:count};
	 		res.send(response);
	  	});
 	}
 	else {
 		var search = {};

 		// admin can see all clients
	 	if (req.user.admin)
	 		var clients = Client.find();
	 	// user can only see his associated client
	 	else
	 		var clients = Client.find({ '_user': req.user._id });	

	 	if (!req.query.actions || (req.query.actions != 'true')) {
		 	clients.select('-actions');
		}
	 	// if filter by client name
	 	if (req.query.name && (req.query.name.length > 0)) {
	 		clients.regex('name', new RegExp(req.query.name,'i'));
	 	}

	 	// if filter by associated (only client associated with current user)
	 	if (req.query.user_id && (req.query.user_id.length > 0)) {
	 		if (!req.user.admin && req.query.user_id != req.user._id) {

	 		}
	 		if (req.user.admin) {
	 			clients = Client.find({ '_user': req.query.user_id });		
	 		}
	 	}

	 	// if filter by user name
	 	if (req.query.nouser && (req.query.nouser ==  "true")) {
                    clients.find({'_user_name': null});
                }
	 	else if (req.query.user && (req.query.user.length > 0)) {
	 		clients.regex('_user_name', new RegExp(req.query.user,'i'));
	 	}

	 	// if filter by stage
	 	if (req.query.stage && (req.query.stage.length > 0)) {
	 		clients.regex('stage', new RegExp('^'+req.query.stage,'i'));
	 	}

	 	// if filter by activity
	 	if (req.query.noactivity && (req.query.noactivity ==  "true")) {
                    clients.find({ $or: [{'activity': ""} , {'activity': null}]});
                }
	 	else if (req.query.activity && (req.query.activity.length > 0)) {
	 		clients.regex('activity', new RegExp('^'+req.query.activity,'i'));
	 	}
                
                
        // filter by postal_code
		if (req.query.postalcode && (req.query.postalcode.length > 0)) {
	        clients.regex('address.postal_code', new RegExp('^'+req.query.postalcode,'i'));
            // console.log("postal_code");
            //clients.find( { 'activity' : "Institut" } );
	 	}
                
                // filter by city
	     if (req.query.city && (req.query.city.length > 0)) {
        	clients.regex('address.city', new RegExp('^'+req.query.city,'i'));
	 	}
                
        // If archive is not specified, returns only activated
        // If archive is false, returns only activated
        // If archive is true, returns all
        if (!(req.query.archive) || (req.query.archive == 'false')) {
            clients.find({'active': true});
        }

        if (req.query.noactions && (req.query.noactions ==  "true")) {
        	clients.find({'last_action_date': null});
        }
        else {
	        if (req.query.last_action_date_from && (req.query.last_action_date_from.length > 0)) {
	        	var date = new Date(req.query.last_action_date_from);
	        	if (!isNaN(date.valueOf())) {
	        		clients.find({"last_action_date": {"$gte": req.query.last_action_date_from}});	
	        	}
	        }
	        if (req.query.last_action_date_to && (req.query.last_action_date_to.length > 0)) {
	        	var date = new Date(req.query.last_action_date_to);
	        	if (!isNaN(date.valueOf())) {
	        		clients.find({"last_action_date": {"$lte": req.query.last_action_date_to}});	
	        	}
	        }
	    }
        // if (req.query.update_date_to && (req.query.update_date_to.length > 0)) {
        // 	clients.find({"update_date": {"$lte": req.query.update_date_to}});
        // }
        
        // // Search activity 
        // if (req.query.activity) {
        //        clients.regex('activity', new RegExp(req.query.activity,'i'));
        // }
                
	 	// if offset
	 	if (req.query.offset) {
	 		clients.skip(req.query.offset);
	 	}

	 	// if limit
	 	if (req.query.limit) {
	 		clients.limit(req.query.limit);
	 	}
	 	// if sort
	 	if (!req.query.sort) {
	 		clients.sort({name: 1});
	 	}
	 	else {
	 		var order = 1;
	 		if (req.query.order && req.query.order == 'desc')
	 			order = -1;
	 		// dynamic query search
	 		var obj = {};
	 		obj[req.query.sort] = order;
	 		clients.sort(obj);
	 	}


	 	clients.populate({
	 		path: '_user',
	 		select: 'firstname lastname user_id name',
	 	}).lean().exec(function (err, clients) {
	 		
	 		res.send(clients);
	 		}
	 	);

	 	// clients.exec(function (err, clients) {
			// if (err) console.log(clients)
			
			// clients.where('_user.firstname').equals('Ted').lean().exec(function (err, clients) {
			// 	res.send(clients);
			// 	}
			// );
			// //filter user


			
	 	// });
	 	// clients.populate('_user', 'firstname lastname user_id').lean().exec(function (err, clients) {
			// if (err) console.log(clients)
			
			// res.send(clients);
	 	// });
	 }
 };

 exports.detail = function(req, res){
 	var client = Client.findById(req.params.id).populate('_user', 'firstname lastname user_id').lean().exec(function (err, client) {
 		if (err) console.log(client)
		res.send(client);
 	});
 };

 exports.new = function(req, res){
 	res.render('newclient');
 };

 exports.edit = function(req, res){
 	var data = req.body;
 	delete data._id;

 	// if client is associated with a user
 	// then get the name of the user to update
 	// the client with it
 	if (data._user) {
 		User.findById(data._user,'name',function(err,user) {
	 		if (err)
				res.send(400,{status:err.message});
			else {
				data._user_name = user.name
				update(data);
			}
 		});
 	}
 	else {
 		update(data);
 	}

 	function update(data) {
 		data.update_date =  new Date();
	 	Client.update({ _id: req.params.id }, { $set: data}, function(err) {
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
 	}
 };


 exports.delete = function(req, res){
 	Client.remove({ _id: req.params.id } ,function(err) {
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
 	// Push 3 contacts by default
 	var contact = {name: ''};
 	req.body.contacts = [];
 	req.body.contacts.push(contact);
 	req.body.contacts.push(contact);
 	req.body.contacts.push(contact);
 	// if user is not an admin then associate this user to the client
 	if (!req.user.admin) {
 		req.body._user = req.user._id;
 		req.body._user_name = req.user._name;
 	}
 	var client = new Client(req.body);
 	client.save(function (err, client) {
		var response = {};
 		if (err) {
			response.status = err.message;
			res.send(400,response);
		}
		else {
			response.status = 'success';
			response.client = client;
			res.send(response);
		}
 	});
 };

  exports.count = function(req, res){
  	Client.count(function (err, count) {
  		if (err) console.log(client)
 		
 		res.send(count);
  	});
  };


 	// Associe un user a un client si le client n'est pas deja associe
	exports.setFollower = function(req, res){
		Client.findById(req.params.id,'_user', { lean: true }, function (err, client) {
			var response = {};
			if (err || (!client)) {
				response.status = 'error';
				res.send(400,response);
			}
			else {
				// @todo : Verifier que le client n'a pas d'association
				// Verifie que le user existe
				// @todo : verifier que le user est actif
				User.findById(req.params.userID,'_id name', { lean: true }, function (err, user) {
			  		if (err || (!user)) {
  						response.status = 'error';
  						res.send(400,response);
  					}
  					else {
  						Client.update({ _id: req.params.id }, { $set: {_user: user._id,_user_name: user.name, update_date: new Date()}}, function(err) {
					  		if (err) {
					  			console.log(err);
		  						response.status = 'error';
		  						res.send(400,response);
		  					}
		  					else {
		  						response.status = 'success';
		  						res.send(response);
		  					}
		  				});
  					}
			  	});
			}
	 	});
	};

 	// Desassocie le user associce a un client
	exports.unsetFollower = function(req, res){
		Client.update({ _id: req.params.id }, { $set: {_user: null, update_date: new Date()}}, function(err) {
			var response = {};
			if (err) {
				response.status = 'error';
				res.send(400,response);
			}
			else {
				response.status = 'success';
				res.send(response);
			}
		});
	};
