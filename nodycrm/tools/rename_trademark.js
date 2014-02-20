
var Client = require('../server/models/client'); 
var User = require('../server/models/user');
var mongoose = require('mongoose');
 
var env = process.env.NODE_ENV || 'development'
  , config = require('../server/config/env')[env]

mongoose.connect(config.db);

var trademarkChange = { oldTrademark : "carita",  newTrademark : "Carita" };
                  

//var r = Client.find ( { other_trademarks : trademarkChange.oldTrademark});
var clients = Client.find ( { activity : "Groupement" } );


console.log(clients);