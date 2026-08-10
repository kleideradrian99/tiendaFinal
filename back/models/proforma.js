'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProformaSchema = Schema({
    nproforma: { type: String, required: true }, // PRF-000001
    cliente: { type: Schema.ObjectId, ref: 'cliente', required: true },
    asesor: { type: Schema.ObjectId, ref: 'admin', required: false },
    detalles: [{
        producto: { type: Schema.ObjectId, ref: 'producto', required: true },
        variedad: { type: String, required: true },
        cantidad: { type: Number, required: true },
        precio_unitario: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    peso_total: { type: Number, required: true },
    envio_precio: { type: Number, required: true },
    impuestos: { type: Number, default: 0 },
    total: { type: Number, required: true },
    estado: { type: String, default: 'Pendiente', enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Procesada'] },
    direccion: { type: Schema.ObjectId, ref: 'direccion', required: false },
    observaciones_cliente: { type: String, required: false },
    observaciones_asesor: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('proforma', ProformaSchema);
