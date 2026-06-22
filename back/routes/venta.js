'use strict'

var express = require('express');
var ventaController = require('../controllers/ventaController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

api.post('/registro_compra_cliente', auth.auth, ventaController.registro_compra_cliente);
api.get('/enviar_correo_compra_cliente/:id', auth.auth, ventaController.enviar_correo_compra_cliente);
api.put('/actualizar_estado_venta_admin/:id', auth.auth, ventaController.actualizar_estado_venta_admin);
api.put('/actualizar_pedido_admin/:id', auth.auth, ventaController.actualizar_pedido_admin);

module.exports = api;