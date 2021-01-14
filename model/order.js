
var mongoose = require('mongoose');


var order = new mongoose.Schema({
    cart: { type: mongoose.Schema.Types.Mixed },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    shipping: { type: Number },
    totalPrice: { type: Number },
    transactionRef: { type: String },
    address: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String }
    },
    date: { type: mongoose.Schema.Types.Date },
    status: { type: String, default: 'ordered'}
})

var model = mongoose.model('orders', order);
module.exports = model;
