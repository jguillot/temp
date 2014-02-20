require('./action.js');

function toLower (v) {
  return v.toLowerCase();
}

var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var clientSchema = new Schema({
    client: ObjectId,
    name: {type: String, required: true},
    stage: {type: String, required: true}, // Prospect | Client
    activity: {type: String},  // Pharmacie|SPA|Hotel|...
    siret: {type: String},
    contacts: [{
        firstname: {type: String},
        name: {type: String},
        position: {type: String},
        title: {type: String},
        phone: {type: String},
        mobile: {type: String},
        fax: {type: String},
        email: {type: String},
    }],
    address: {
        address_line1: {type: String},
        address_line2: {type: String},
        postal_code: {type: String},
        city: {type: String},
        country: {type: String},
        phone: {type: String},
        mobile: {type: String},
        fax: {type: String},
        email: {type: String},
        site: {type: String}
    },
    delivery_address: {
        address_line1: {type: String},
        address_line2: {type: String},
        postal_code: {type: String},
        city: {type: String},
        country: {type: String},
        phone: {type: String},
        mobile: {type: String},
        fax: {type: String},
        email: {type: String}
    },
    description: {type: String},
    other_trademarks: {type: Array},
    product_send_note: {type: String},
    product_send_date: {type: Date},
    _user : { type: String, ref: 'User' },
    _user_name : { type: String},
    actions: [exports.actionSchema],
    active: { type: Boolean , default: true},
    created_date: {type: Date, default: Date.now},
    update_date: {type: Date},
    last_action_date: {type: Date},
    last_action_text: {type: String}
});
 
module.exports = mongoose.model('Client', clientSchema);