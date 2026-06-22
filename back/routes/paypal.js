'use strict'

var express = require('express');
var paypalController = require('../controllers/paypalController');
var auth = require('../middlewares/authenticate');

var api = express.Router();

api.get('/obtener_paypal_client_id', paypalController.obtener_paypal_client_id);
api.post('/crear_orden_paypal', auth.auth, paypalController.crear_orden_paypal);
api.post('/capturar_orden_paypal', auth.auth, paypalController.capturar_orden_paypal);

module.exports = api;
