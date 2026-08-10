'use strict'

var ComprobantePago = require('../models/comprobante_pago');
var Proforma = require('../models/proforma');
var Venta = require('../models/venta');
var Dventa = require('../models/dventa');
var Producto = require('../models/producto');
var path = require('path');
var fs = require('fs');

function zfill(number, width) {
    var numberOutput = Math.abs(number);
    var length = number.toString().length;
    var zero = "0";

    if (width <= length) {
        if (number < 0) {
            return ("-" + numberOutput.toString());
        } else {
            return numberOutput.toString();
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString());
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString());
        }
    }
}

const registrar_comprobante_cliente = async function(req, res) {
    if (req.user) {
        try {
            var data = req.body;

            // Verificar si hay archivo de comprobante subido
            if (req.file) {
                data.comprobante = req.file.filename;
            } else {
                return res.status(400).send({ message: 'Debe subir un archivo de comprobante.' });
            }

            data.cliente = req.user.sub;
            data.estado = 'Pendiente';

            // Validar que la proforma exista y esté aprobada
            let proforma = await Proforma.findById(data.proforma);
            if (!proforma) {
                return res.status(404).send({ message: 'Proforma no encontrada.' });
            }

            if (proforma.estado !== 'Aprobada') {
                return res.status(400).send({ message: 'La proforma debe estar aprobada para registrar un pago.' });
            }

            // Crear el registro de comprobante
            let reg = await ComprobantePago.create(data);

            res.status(200).send({ data: reg });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error al registrar el comprobante.', error: error.message });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_comprobantes_cliente = async function(req, res) {
    if (req.user) {
        try {
            let data = await ComprobantePago.find({ cliente: req.user.sub })
                .populate('proforma')
                .sort({ createdAt: -1 });
            res.status(200).send({ data: data });
        } catch (error) {
            res.status(500).send({ message: 'Error al obtener comprobantes.' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_comprobantes_admin = async function(req, res) {
    if (req.user && ['admin', 'finanzas', 'direccion'].includes(req.user.role)) {
        try {
            let filtro = {};
            if (req.query.estado) {
                filtro.estado = req.query.estado;
            }

            let data = await ComprobantePago.find(filtro)
                .populate('cliente')
                .populate('proforma')
                .sort({ createdAt: -1 });

            res.status(200).send({ data: data });
        } catch (error) {
            res.status(500).send({ message: 'Error al obtener los comprobantes para el administrador.' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const evaluar_comprobante_admin = async function(req, res) {
    if (req.user && ['admin', 'finanzas', 'direccion'].includes(req.user.role)) {
        try {
            let id = req.params['id'];
            let data = req.body; // estado ('Aprobado' o 'Rechazado'), observaciones

            let comprobante = await ComprobantePago.findById(id).populate('proforma');
            if (!comprobante) {
                return res.status(404).send({ message: 'Comprobante no encontrado.' });
            }

            if (comprobante.estado !== 'Pendiente') {
                return res.status(400).send({ message: 'Este comprobante ya ha sido evaluado.' });
            }

            comprobante.estado = data.estado;
            comprobante.observaciones = data.observaciones || '';
            await comprobante.save();

            if (data.estado === 'Aprobado') {
                // 1. Cambiar estado de la proforma a 'Procesada'
                let proforma = await Proforma.findById(comprobante.proforma._id);
                if (proforma) {
                    proforma.estado = 'Procesada';
                    await proforma.save();

                    // 2. Generar correlativo de la nueva Venta
                    var venta_last = await Venta.find().sort({ createdAt: -1 });
                    var serie;
                    var correlativo;
                    var n_venta;

                    if (venta_last.length == 0) {
                        serie = '001';
                        correlativo = '000001';
                        n_venta = serie + '-' + correlativo;
                    } else {
                        var last_nventa = venta_last[0].nventa;
                        var arr_nventa = last_nventa.split('-');

                        if (arr_nventa[1] != '999999') {
                            var new_correlativo = zfill(parseInt(arr_nventa[1]) + 1, 6);
                            n_venta = arr_nventa[0] + '-' + new_correlativo;
                        } else {
                            var new_serie = zfill(parseInt(arr_nventa[0]) + 1, 3);
                            n_venta = new_serie + '-000001';
                        }
                    }

                    // 3. Crear el documento Venta
                    let venta = await Venta.create({
                        cliente: proforma.cliente,
                        nventa: n_venta,
                        subtotal: proforma.subtotal,
                        envio_titulo: 'Envío FedEx - Cotizado en Proforma ' + proforma.nproforma,
                        envio_precio: proforma.envio_precio,
                        transaccion: 'Pago manual - Aprobado: ' + id,
                        cupon: 'Ninguno',
                        estado: 'Pago confirmado',
                        direccion: proforma.direccion,
                        nota: 'Pedido automático generado por aprobación de proforma ' + proforma.nproforma + '. Observaciones de pago: ' + (data.observaciones || 'Ninguna'),
                        proforma: proforma._id,
                        historial_estados: [{
                            estado: 'Pago confirmado',
                            fecha: new Date(),
                            responsable: req.user.email || 'Sistema de Finanzas',
                            motivo: 'Aprobación de comprobante de pago manual #' + id
                        }],
                        userid: req.user.sub
                    });

                    // 4. Crear los detalles de la venta (Dventa) y descontar stock
                    for (let item of proforma.detalles) {
                        await Dventa.create({
                            producto: item.producto,
                            venta: venta._id,
                            subtotal: item.subtotal,
                            variedad: item.variedad,
                            cantidad: item.cantidad,
                            cliente: proforma.cliente
                        });

                        // Descontar stock del producto
                        let prod = await Producto.findById(item.producto);
                        if (prod) {
                            let new_stock = parseInt(prod.stock) - parseInt(item.cantidad);
                            if (new_stock < 0) new_stock = 0; // Prevenir negativos
                            await Producto.findByIdAndUpdate(item.producto, { stock: new_stock });
                        }
                    }
                }
            } else if (data.estado === 'Rechazado') {
                // Si se rechaza, la proforma vuelve a estar 'Aprobada' para que el cliente pueda corregir o subir otro comprobante.
                let proforma = await Proforma.findById(comprobante.proforma._id);
                if (proforma) {
                    proforma.estado = 'Aprobada';
                    await proforma.save();
                }
            }

            res.status(200).send({ data: comprobante });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error al evaluar el comprobante de pago.', error: error.message });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

// Ruta para obtener la imagen/PDF del comprobante
const obtener_comprobante_archivo = async function(req, res) {
    var img = req.params['img'];

    fs.stat('./uploads/comprobantes/' + img, function(err) {
        if (!err) {
            let path_img = './uploads/comprobantes/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/default.png'; // fallback default image
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
}

module.exports = {
    registrar_comprobante_cliente,
    obtener_comprobantes_cliente,
    listar_comprobantes_admin,
    evaluar_comprobante_admin,
    obtener_comprobante_archivo
}
