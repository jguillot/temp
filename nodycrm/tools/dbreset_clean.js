
/**
 * Module dependencies.
 */

var Client = require('./server/models/client'); 
var User = require('./server/models/user');
var mongoose = require('mongoose');
 

var clients = [];
var contact = {name : ''};
var contacts = [];
contacts.push(contact);
contacts.push(contact);
contacts.push(contact);


var users = [
	{firstname:'Admin1',lastname:'Admin',initial: 'A1', email:'admin@opalemonaco.com',password:'pass',admin:true},
	{firstname:'Admin2',lastname:'Admin',initial: 'A2', email:'admin2@opalemonaco.com',password:'pass2',admin:true},
];


//mongoose.connect('mongodb://admin:nove9021@localhost:27017/nodycrm');
mongoose.connect('mongodb://localhost:27017/nodycrm');


// Reset schema
Client.remove(function() {
	User.remove(addFake);
});

// User.remove();
// Client.remove();
// addFake();


function addUsers() {
	for (var i = 0 ; i < users.length ; i++) {
		var user = new User(users[i]);
		taskToComplete++;
		user.save(function (err, user) {
			var response = {};
	 		if (err)
	 			console.log(err.message);
			else 
				console.log(user.firstname+' ajoute');
			taskComplete();
	 	});	
	}
}
function addFake() {
	addUsers();
}

var taskToComplete = 0;
var taskCompleted = 0;
function taskComplete() {
	taskCompleted++;
	if (taskCompleted == taskToComplete) {
		console.log('Tasks completed : ' + taskCompleted);
		process.exit(0);
	}
}
