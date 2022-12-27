'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PedidoSchema = Schema({
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    npedido: { type: String, require: true },
    subtotal: { type: Number, require: true },
    envio_precio: { type: Number, require: true },
    transaccion: { type: String, require: true },
    cupon: { type: String, require: true },
    estado: { type: String, require: true },
    direccion: { type: Schema.ObjectId, ref: 'direccion', require: true },
    nota: { type: String, require: true },
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('pedido', PedidoSchema);