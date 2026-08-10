'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MensajeChatSchema = Schema({
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    asesor: { type: Schema.ObjectId, ref: 'admin', required: false },
    remitente: { type: String, required: true, enum: ['cliente', 'asesor'] },
    mensaje: { type: String, required: true },
    adjunto: { type: String, required: false }, // En caso de adjuntar imágenes
    leido: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 7776000 }
});

module.exports = mongoose.model('mensaje_chat', MensajeChatSchema);
