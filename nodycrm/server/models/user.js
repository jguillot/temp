function toLower (v) {
  return v.toLowerCase();
}

var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;
var Client = require('./client.js'); 
var helper = require('../helper');


var userSchema = new Schema({
    user: ObjectId,
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    initial: {type: String, required: true},
    name: {type: String}, // ==> firstname+lastname (for search)
    email: {type: String, required: true, unique: true, set: toLower },
    password: {type: String, required: true },
    active: {type: Boolean, default: true },
    admin: {type: Boolean, default: false },
    clients : [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    created_date: {type: Date, default: Date.now}
});

userSchema.pre('save', function (next) {
  console.log('pre save: '+this.firstname);
  this.name = helper.buildName(this.firstname,this.lastname);
  next();
});


userSchema.post('save', function (user) {
  // update client
  Client.update({ _user: user._id }, { 
    $set: { _user_name: user.name }},function() {
      console.log('post save');
    }
  );
})

userSchema.methods.validPassword = function (password) {
  return this.password === password;
}
 
module.exports = mongoose.model('User', userSchema);