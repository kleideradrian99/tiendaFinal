'use strict'

var express = require('express');
var carritoController = require('../controllers/carritoAdminController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

api.post('/agregar_al_carrito', auth.auth, carritoController.agregar_al_carrito);
api.get('/obtener_carrito_admin/:id', auth.auth, carritoController.obtener_carrito_admin);
api.get('/obtener_ordenes', auth.auth, carritoController.obtener_ordenes);
api.delete('/eliminar_carrito_admin/:id', auth.auth, carritoController.eliminar_carrito_admin);

module.exports = api;