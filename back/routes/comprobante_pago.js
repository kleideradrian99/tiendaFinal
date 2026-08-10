'use strict'

var express = require('express');
var controller = require('../controllers/ComprobantePagoController');
var auth = require('../middlewares/authenticate');

// Configuración de Multer para la subida de comprobantes
var multer = require('multer');
var path = require('path');
var fs = require('fs');

// Asegurar que exista la carpeta de destino
var dir = './uploads/comprobantes';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/comprobantes')
    },
    filename: function (req, file, cb) {
        // Generar un nombre único basado en timestamp + extensión original
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Aceptar imágenes y PDFs únicamente
        var filetypes = /jpeg|jpg|png|pdf/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: Solo se permiten imágenes (JPG, PNG) y PDFs."));
    }
});

var api = express.Router();

api.post('/registrar_comprobante_cliente', [auth.auth, upload.single('comprobante')], controller.registrar_comprobante_cliente);
api.get('/obtener_comprobantes_cliente', auth.auth, controller.obtener_comprobantes_cliente);
api.get('/listar_comprobantes_admin', auth.auth, controller.listar_comprobantes_admin);
api.put('/evaluar_comprobante_admin/:id', auth.auth, controller.evaluar_comprobante_admin);
api.get('/obtener_comprobante_archivo/:img', controller.obtener_comprobante_archivo);

module.exports = api;
