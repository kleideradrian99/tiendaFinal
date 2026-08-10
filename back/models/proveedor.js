'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProveedorSchema = Schema({
    razon_social: { type: String, required: true },
    contacto: { type: String, required: false },
    telefono: { type: String, required: false },
    email: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('proveedor', ProveedorSchema);
