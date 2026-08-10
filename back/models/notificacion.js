'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificacionSchema = Schema({
    titulo: { type: String, required: true },
    mensaje: { type: String, required: true },
    usuario: { type: Schema.ObjectId, ref: 'admin', required: false },
    leido: { type: Boolean, default: false },
    tipo: { type: String, required: true }, // 'pedido', 'ticket', 'chat'
    createdAt: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('notificacion', NotificacionSchema);
