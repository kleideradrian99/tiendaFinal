'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FedexTarifarioSchema = Schema({
    peso: { type: Number, required: true }, // Peso límite superior (ej. 0.5, 1.0, 1.5...)
    A: { type: Number, required: true },
    B: { type: Number, required: true },
    C: { type: Number, required: true },
    D: { type: Number, required: true },
    E: { type: Number, required: true },
    F: { type: Number, required: true },
    G: { type: Number, required: true },
    H: { type: Number, required: true },
    I: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('fedex_tarifario', FedexTarifarioSchema);
