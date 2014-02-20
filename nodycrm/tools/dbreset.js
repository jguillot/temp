/**
* Module dependencies.
*/

var Client = require('./server/models/client');
var User = require('./server/models/user');
var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development'
  , config = require('./server/config/env')[env]

var clients = [];
var contact = {name : ''};
var contacts = [];
contacts.push(contact);
contacts.push(contact);
contacts.push(contact);

var addresses = [];
for (var i = 0 ; i < 10 ; i++) {
        var address = {
                address_line1 : i + ' rue du hasard',
                address_line2 : i + ' Bat',
                city : i + ' Paris',
                postal_code : i + '0100',
                country        : 'France'
        };

        client = {
                name : 'Entrerpise - '+i,
                contact : 'Contact - '+i,
        stage : (Math.random()<0.8?'Prospect':'Client'),
        activity : (Math.random()<0.5?'Pharmacie':'SPA'),
        activity : (Math.random()<0.5?'Pharmacie':'SPA'),
                address         : address,
                description : 'Description number : '+i,
        archive : (Math.random()<0.7?false:true),
        contacts        : contacts
        // contact4 : {name:'contact name',post:'what',title:'director'}
        }
        clients.push(client);
 // var actions = [];
 // for (var a=0 ; a<3 ; j++) {
 // action = {
 // }
}


var users = [
		{firstname:'Admin1',lastname:'Admin',initial: 'A1', email:'admin@opalemonaco.com',password:'pass',admin:true},
		{firstname:'Admin2',lastname:'Admin',initial: 'A2', email:'admin2@opalemonaco.com',password:'pass2',admin:true}
];


//mongoose.connect('mongodb://admin:nove9021@localhost:27017/nodycrm');
mongoose.connect(config.db);


// Reset schema
Client.remove(function() {
        User.remove(addFake);
});

// User.remove();
// Client.remove();
// addFake();

function addClients() {
        for (var i = 0 ; i < clients.length ; i++) {
                
                var client = new Client(clients[i]);
                taskToComplete++;
                client.save(function (err, client) {
                        var response = {};
                         if (err)
                                 console.log(err.message);
                        else
                                console.log(client.name+' ajoute');
                        taskComplete();
                 });        
        }
}

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
        addClients();
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
