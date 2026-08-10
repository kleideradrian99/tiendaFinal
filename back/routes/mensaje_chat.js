'use strict'

var express = require('express');
var chatController = require('../controllers/MensajeChatController');
var auth = require('../middlewares/authenticate');

var api = express.Router();

api.post('/enviar_mensaje_cliente', auth.auth, chatController.enviar_mensaje_cliente);
api.post('/enviar_mensaje_asesor', [auth.auth, auth.checkRole(['admin', 'vendedor', 'direccion', 'asesora', 'soporte'])], chatController.enviar_mensaje_asesor);
api.get('/listar_mensajes_cliente', auth.auth, chatController.listar_mensajes_cliente);
api.get('/listar_mensajes_asesor/:clienteId', [auth.auth, auth.checkRole(['admin', 'vendedor', 'direccion', 'asesora', 'soporte'])], chatController.listar_mensajes_asesor);
api.get('/listar_conversaciones_asesor', [auth.auth, auth.checkRole(['admin', 'vendedor', 'direccion', 'asesora', 'soporte'])], chatController.listar_conversaciones_asesor);

module.exports = api;
