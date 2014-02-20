var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;
  
  
var actionSchema = new Schema({
    actionId:           ObjectId,
    _user_initial: { type: String },
    _user_name:     { type: String },
    _user_id : { type: String},
    actionDate:         { type: Date },
    comment:            { type: String }
});

module.exports = mongoose.model('Action', actionSchema);
    