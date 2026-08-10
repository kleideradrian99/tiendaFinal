'use strict'

var express = require('express');
var proformaController = require('../controllers/ProformaController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

// Rutas Cliente
api.post('/solicitar_proforma_cliente', auth.auth, proformaController.solicitar_proforma_cliente);
api.get('/listar_proformas_cliente', auth.auth, proformaController.listar_proformas_cliente);
api.get('/obtener_detalle_proforma_cliente/:id', auth.auth, proformaController.obtener_detalle_proforma_cliente);
api.post('/procesar_proforma_venta', auth.auth, proformaController.procesar_proforma_venta);

// Rutas Administrativas
api.get('/listar_proformas_admin', [auth.auth, auth.checkRole(['admin', 'asesora', 'direccion', 'finanzas'])], proformaController.listar_proformas_admin);
api.put('/actualizar_proforma_admin/:id', [auth.auth, auth.checkRole(['admin', 'asesora', 'direccion'])], proformaController.actualizar_proforma_admin);

module.exports = api;
