'use strict'

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var port = process.env.PORT || 4201;

var server = require('http').createServer(app);
var io = require('socket.io')(server, {
    cors: { origin: '*' }
});

io.on('connection', function (socket) {
    socket.on('delete-carrito', function (data) {
        io.emit('new-carrito', data);
        console.log(data);
    });


    socket.on('add-carrito-add', function (data) {
        io.emit('new-carrito-add', data);
        console.log(data);
    });

});


var cliente_route = require('./routes/cliente');
var admin_route = require('./routes/admin');
var producto_route = require('./routes/producto');
var cupon_route = require('./routes/cupon');
var config_route = require('./routes/config');
var carrito_route = require('./routes/carrito');
var venta_route = require('./routes/venta');
var descuento_route = require('./routes/descuento');
var carrito_admin = require('./routes/carritoAdmin');

mongoose.connect('mongodb+srv://kleidermachado:GjrxtBf7hSrkSZcs@cluster0.qowwswz.mongodb.net/tienda')
    .then(function () {
        server.listen(port, function () {
            console.log('Servidor corriendo en el puerto ' + port);
        });
    })
    .catch(function (err) {
        console.log(err);
    });

// mongoose.connect('mongodb://127.0.0.1:27017/tienda')
//     .then(function () {
//         server.listen(port, function () {
//             console.log('Servidor corriendo en el puerto ' + port);
//         });
//     })
//     .catch(function (err) {
//         console.log(err);
//     });

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow', 'GET, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use('/api', cliente_route);
app.use('/api', admin_route);
app.use('/api', producto_route);
app.use('/api', cupon_route);
app.use('/api', config_route);
app.use('/api', carrito_route);
app.use('/api', venta_route);
app.use('/api', descuento_route);
app.use('/api', carrito_admin);

module.exports = app;
