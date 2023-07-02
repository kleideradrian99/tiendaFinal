'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CarritoAdminSchema = Schema({
    producto: { type: Schema.ObjectId, required: true },
    precio: {type: Number, required: true},
    cantidad: { type: Number, require: true },
    tallas: [{type: Object, require:false}],
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    observaciones: {type: String, required: true},
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('carritoAdmin', CarritoAdminSchema);