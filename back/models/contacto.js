'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactoSchema = Schema({
    cliente: {type: String, required: true},
    mensaje: {type: String, required: true},
    asunto: {type: String, required: true},
    telefono: {type: String, required: true},
    correo: {type: String, required: true},
    venta: { type: Schema.ObjectId, ref: 'venta', required: false },
    mensajes: [{
        emisor: { type: String }, // 'cliente' o 'asesor' o email del admin
        mensaje: { type: String },
        fecha: { type: Date, default: Date.now },
        adjuntos: [{ type: String }]
    }],
    evidencias: [{ type: String }],
    estado: {type: String, required: true}, // 'Abierto', 'En proceso', 'Cerrado'
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('contacto',ContactoSchema);