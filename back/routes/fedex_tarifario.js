'use strict'

var express = require('express');
var fedexTarifarioController = require('../controllers/FedexTarifarioController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

api.post('/registro_tarifario_admin', auth.auth, fedexTarifarioController.registro_tarifario_admin);
api.get('/listar_tarifarios_admin', auth.auth, fedexTarifarioController.listar_tarifarios_admin);
api.delete('/eliminar_tarifario_admin/:id', auth.auth, fedexTarifarioController.eliminar_tarifario_admin);
api.get('/obtener_tarifa_envio/:peso/:pais', auth.auth, fedexTarifarioController.obtener_tarifa_envio_cliente);

module.exports = api;
