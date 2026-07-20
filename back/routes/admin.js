'use strict'

var express = require('express');
var adminController = require('../controllers/AdminController');
var auth = require('../middlewares/authenticate');
var api = express.Router();

api.post('/registro_admin',adminController.registro_admin);
api.post('/login_admin',adminController.login_admin);

api.get('/obtener_mensajes_admin',auth.auth,adminController.obtener_mensajes_admin);
api.put('/cerrar_mensaje_admin/:id',auth.auth,adminController.cerrar_mensaje_admin);

api.get('/obtener_ventas_admin/:desde?/:hasta?',auth.auth,adminController.obtener_ventas_admin);
api.get('/kpi_ganancias_mensuales_admin',auth.auth,adminController.kpi_ganancias_mensuales_admin);

api.post('/registrar_usuario_interno', auth.auth, adminController.registrar_usuario_interno);
api.get('/listar_usuarios_internos/:filtro?', auth.auth, adminController.listar_usuarios_internos);
api.get('/obtener_usuario_interno/:id', auth.auth, adminController.obtener_usuario_interno);
api.put('/actualizar_usuario_interno/:id', auth.auth, adminController.actualizar_usuario_interno);
api.delete('/eliminar_usuario_interno/:id', auth.auth, adminController.eliminar_usuario_interno);
api.post('/enviar_recuperacion_admin', adminController.enviar_recuperacion_admin);
api.post('/restablecer_contrasena_admin', adminController.restablecer_contrasena_admin);

module.exports = api;