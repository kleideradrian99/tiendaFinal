'use strict'

var express = require('express');
var clienteController = require('../controllers/ClienteController');
var adminController = require('../controllers/AdminController');
var auth = require('../middlewares/authenticate');

var path = require('path');
var multer = require('multer');
var fs = require('fs');

if (!fs.existsSync('./uploads/tickets')) {
    fs.mkdirSync('./uploads/tickets', { recursive: true });
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/tickets');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({ storage: storage });
var api = express.Router();

// Rutas Cliente
api.post('/registro_ticket_cliente', auth.auth, clienteController.registro_ticket_cliente);
api.get('/listar_tickets_cliente', auth.auth, clienteController.listar_tickets_cliente);
api.get('/obtener_ticket_cliente/:id', auth.auth, clienteController.obtener_ticket_cliente);
api.put('/responder_ticket_cliente/:id', auth.auth, clienteController.responder_ticket_cliente);
api.post('/subir_evidencia_ticket_cliente/:id', [auth.auth, upload.single('evidencia')], clienteController.subir_evidencia_ticket_cliente);
api.get('/obtener_evidencia_ticket/:img', clienteController.obtener_evidencia_ticket);

// Rutas Admin
api.get('/obtener_ticket_admin/:id', auth.auth, adminController.obtener_ticket_admin);
api.put('/responder_ticket_admin/:id', auth.auth, adminController.responder_ticket_admin);

module.exports = api;
