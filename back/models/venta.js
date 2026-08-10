'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    nventa: { type: String, require: true },
    subtotal: { type: Number, require: true },
    envio_titulo: { type: String, require: false },
    envio_precio: { type: Number, require: false },
    transaccion: { type: String, require: false },
    cupon: { type: String, require: true },
    estado: { type: String, require: true },
    direccion: { type: Schema.ObjectId, ref: 'direccion', require: true },
    nota: { type: String, require: true },
    notas_internas: { type: String, required: false },
    proforma: { type: Schema.ObjectId, ref: 'proforma', required: false },
    evidencias: [{ type: String }],
    peso_real: { type: Number, default: 0 },
    dimensiones_alto: { type: Number, default: 0 },
    dimensiones_ancho: { type: Number, default: 0 },
    dimensiones_largo: { type: Number, default: 0 },
    ncajas: { type: Number, default: 1 },
    tracking_fedex: { type: String, required: false },
    historial_transito_fedex: [{
        estado: { type: String },
        ubicacion: { type: String },
        fecha: { type: Date, default: Date.now },
        descripcion: { type: String }
    }],
    alerta_novedad_envio: { type: String, required: false },
    comision_asesora: { type: Number, default: 0 },
    comision_pasarela: { type: Number, default: 0 },
    trm_aplicada: { type: Number, default: 4000 },
    historial_estados: [{
        estado: { type: String },
        fecha: { type: Date, default: Date.now },
        responsable: { type: String },
        motivo: { type: String }
    }],
    userid: { type: Schema.ObjectId, ref: 'admin', required: false },
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('venta', VentaSchema);