'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CarritoAdminSchema = Schema({
    producto: { type: Schema.ObjectId, ref: 'producto', required: false },
    variedad: [{ type: Schema.Types.Mixed, require: false }],
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    observacion: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('carritoAdmin', CarritoAdminSchema);