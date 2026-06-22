'use strict'

var express = require('express');
var culqiController = require('../controllers/culqiController');
var auth = require('../middlewares/authenticate');

var api = express.Router();

api.get('/obtener_culqi_public_key', culqiController.obtener_public_key);
api.post('/crear_cargo_culqi', auth.auth, culqiController.crear_cargo);

module.exports = api;
