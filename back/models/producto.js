'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    titulo: { type: String, required: true },
    slug: { type: String, required: true },
    galeria: [{ type: Object, required: false }],
    portada: { type: String, required: false },
    precio: { type: Number, required: true },
    precio_cop: { type: Number, default: 0, required: true },
    descripcion: { type: String, required: false },
    contenido: { type: String, required: false },
    stock: { type: Number, required: false },
    nventas: { type: Number, default: 0, required: false },
    npuntos: { type: Number, default: 0, required: false },
    categoria: { type: String, default: 'Moda', required: true },
    titulo_variedad: { type: String, default: 'Talla', required: false },
    variedades: [{ type: Object, require: false }],
    estado: { type: String, default: 'Edicion', required: true },
    estado_disponibilidad: { type: String, default: 'Disponible', required: true },
    en_tendencia: { type: Boolean, default: false, required: false },
    fecha_programada: { type: Date, required: false },
    peso: { type: Number, default: 0, required: false },
    typeProducto: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('producto', ProductoSchema);