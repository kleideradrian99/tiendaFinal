'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    titulo: { type: String, required: true },
    slug: { type: String, required: true },
    galeria: [{ type: Object, required: false }],
    portada: { type: String, required: false },
    precio: { type: Number, required: true },
    descripcion: { type: String, required: false },
    contenido: { type: String, required: false },
    stock: { type: Number, required: false },
    nventas: { type: Number, default: 0, required: false },
    npuntos: { type: Number, default: 0, required: false },
    categoria: { type: String,default:'Moda', required: true },
    titulo_variedad: { type: String, default: 'Talla', required: false },
    estado: { type: String, default: 'Edicion', required: true },
    typeProducto: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = mongoose.model('producto', ProductoSchema);