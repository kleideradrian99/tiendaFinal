'use strict'

var express = require('express');
var ventaController = require('../controllers/ventaController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

var multer = require('multer');
var path = require('path');
var fs = require('fs');

// Crear la carpeta si no existe
var dir = './uploads/pedidos';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/pedidos')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

api.post('/registro_compra_cliente', auth.auth, ventaController.registro_compra_cliente);
api.get('/enviar_correo_compra_cliente/:id', auth.auth, ventaController.enviar_correo_compra_cliente);
api.put('/actualizar_estado_venta_admin/:id', [auth.auth, auth.checkRole(['admin', 'direccion'])], ventaController.actualizar_estado_venta_admin);
api.put('/actualizar_pedido_admin/:id', [auth.auth, auth.checkRole(['admin'])], ventaController.actualizar_pedido_admin);
api.put('/actualizar_estado_detalle_venta_admin/:id', [auth.auth, auth.checkRole(['admin', 'compras', 'direccion', 'logistica'])], ventaController.actualizar_estado_detalle_venta_admin);
api.post('/subir_evidencia_pedido_admin/:id', [auth.auth, auth.checkRole(['admin', 'compras', 'logistica', 'direccion']), upload.single('evidencia')], ventaController.subir_evidencia_pedido_admin);
api.get('/obtener_evidencia_archivo/:img', ventaController.obtener_evidencia_archivo);
api.put('/actualizar_abastecimiento_prenda_admin/:id', [auth.auth, auth.checkRole(['admin', 'compras', 'direccion', 'asesora'])], ventaController.actualizar_abastecimiento_prenda_admin);
api.put('/actualizar_empaque_despacho_admin/:id', [auth.auth, auth.checkRole(['admin', 'logistica', 'direccion'])], ventaController.actualizar_empaque_despacho_admin);
api.put('/registrar_escala_transito_admin/:id', [auth.auth, auth.checkRole(['admin', 'logistica', 'direccion'])], ventaController.registrar_escala_transito_admin);
api.get('/obtener_balance_financiero_admin/:desde?/:hasta?', [auth.auth, auth.checkRole(['admin', 'finanzas', 'direccion'])], ventaController.obtener_balance_financiero_admin);
api.put('/actualizar_trm_pedido_admin/:id', [auth.auth, auth.checkRole(['admin', 'finanzas', 'direccion'])], ventaController.actualizar_trm_pedido_admin);

module.exports = api;