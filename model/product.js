// var mongoose = require('mongoose');
const mongoose = require('mongoose'); mongoose.set('useCreateIndex', true);

var product = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    // qty_available: { type: String, required: true },
    description: { type: String, required: false },
    sizes: [{ size: String, qty: Number }],
    pictures: { type: Array, required: true },
    available: { type: Boolean, default: true },
    tags: { type: Array }
}, { timestamps: true })

product.index({ name: 'text' })

var model = mongoose.model('products', product);
module.exports = model;