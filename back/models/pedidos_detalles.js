'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DpedidoSchema = Schema({
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    pedido: {type: Schema.ObjectId, ref: 'pedido', require: true},
    subtotal: {type: Number, require: true}, 
    variedad: {type: String, require: true},
    cantidad: {type: Number, require: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('dpedido', DpedidoSchema);