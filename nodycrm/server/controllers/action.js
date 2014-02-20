var User = require('../models/user.js');
var Client = require('../models/client.js');
var Action = require('../models/action.js');
var helper = require('../helper');


exports.listjson = function(req, res) {
    if (req.params.clients) 
    {
        var actions = Client.findById (req.params.idclient,'actions').lean().exec(
            function(err, client) 
            {
                if (err) console.log(client);
                res.send(client.actions);
            });
    }
    else if (req.params.iduser)  
    {
        var actions = Client.find ({'actions._user_id': req.params.iduser},'actions _id name').lean().exec(
            function(err, clients) 
            {
                if (err) console.log(clients);

                // @todo : optimize...should have a better mongoose query to get only actions needed and send less data to client
                // ugly, ugly and ugly !!!! at least it's O(n)...but still
                var filteredActions = [];
                for (var i = 0 ; i < clients.length ; i++) {
                    for (var j = 0 ; j < clients[i].actions.length ; j++) {
                        if (clients[i].actions[j]._user_id == req.params.iduser) {
                            filteredActions.push({
                                client_name: clients[i].name,
                                client_id: clients[i]._id,
                                comment: clients[i].actions[j].comment,
                                actionDate: clients[i].actions[j].actionDate
                            })
                        }
                    }
                }
                console.log(req.params.iduser);
                res.send(filteredActions);
            });
    }
};

exports.detail = function(req, res) {

};

exports.create = function(req, res) {
    //mapping
    var data = {
        comment: req.body.comment,
        _user_initial: req.user.initial,
        _user_name: req.user.name,
        _user_id: req.user._id,
        actionDate: new Date(),
    }
    console.log(data);
    var action = new Action(data);
    // CHERCHE LE CLIENT ASSOCIE
    var client = Client.findById (req.params.idclient, function(err, client) {
        response = {};
        if (!err) {
            client.actions.push(action);
            client.last_action_date =  new Date();
            client.last_action_text = data.comment;
            client.save( function(err, client) {
                if (err) {
                    response.status = 'error';
                    console.log('%%% Erreur en créant une action');
                }
                else {
                    response.status = 'success';
                    // @todo : should send only the last action inserted
                    response.data = action;

                }
                res.send(response);

            });
        } else { // CLIENT PAS TROUVE
            console.log('%%% Client pas trouvé');
            response.status = 'error';
            res.send(response);
        }
    });
};

exports.edit = function(req, res){

    var client = Client.findById (req.params.idclient, function(err, client) {
    var response = {};

        if (!err) {
            var tempActions = client.actions;
            var i = 0;
            while (i < tempActions.length && tempActions[i]._id != req.params.idaction) {
                i = i + 1;
            }
            if (tempActions[i]._id == req.params.idaction) {
                tempActions[i].comment = req.body.comment;
                client.actions = []; // the actions are not saved without this line...weird
                client.actions = tempActions;
                if (client.last_action_date.toString() == tempActions[i].actionDate.toString()) {
                    client.last_action_text = req.body.comment;
                }
                client.save(function(err) {
                    if (err) response.status = 'error';
                    else {
                        response.status = 'success';
                        response.data = tempActions[i];
                    }
                    res.send(response);
                });
            }
            else {
                response.status = 'error';
                res.send(response);
            }
            
            // var i = 0;
            // while (i < client.actions.length && client.actions[i]._id != req.params.idaction) {
            //     i = i + 1;
            // }
            // if (client.actions[i]._id == req.params.idaction) {
            //     client.actions[i].comment = req.body.comment;
            //     action = client.actions[i];
            //     client.last_action_date =  new Date();
            //     client.save( function(err, client) {
            //         if (err) {
            //             response.status = 'error';
            //             console.log('%%% Erreur en créant une action');
            //         }
            //         else {
            //             console.log(client.actions[0]);
            //             response.status = 'success';
            //             response.data = action;
            //         }
            //         res.send(response);
            //     });
            // }
            // else {
            //     response.status = 'error';
            //     res.send(response);
            // }
        } 
    else { // CLIENT PAS TROUVE
            console.log('%%% Client pas trouvé');
            response.status = 'error';
            res.send(response);
        }
    });
};