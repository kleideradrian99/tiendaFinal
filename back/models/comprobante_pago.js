'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ComprobantePagoSchema = Schema({
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    proforma: { type: Schema.ObjectId, ref: 'proforma', required: true },
    monto: { type: Number, required: true }, 
    moneda: { type: String, required: true, default: 'USD' }, 
    trm: { type: Number, required: true, default: 1 }, 
    fecha_pago: { type: Date, required: true },
    cuenta_destino: { type: String, required: true }, 
    comprobante: { type: String, required: true }, 
    estado: { type: String, default: 'Pendiente', enum: ['Pendiente', 'Aprobado', 'Rechazado'] },
    observaciones: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comprobante_pago', ComprobantePagoSchema);
