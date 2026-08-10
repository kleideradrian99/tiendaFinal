var Venta = require('../models/venta');
var Dventa = require('../models/dventa');
var Producto = require('../models/producto');

var Carrito = require('../models/carrito');
var CarritoAdmin = require('../models/carritoAdmin');


var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var path = require('path');
var Notificacion = require('../models/notificacion');



const registro_compra_cliente = async function (req, res) {
    if (req.user) {

        var data = req.body;
        var detalles = data.detalles;

        var venta_last = await Venta.find().sort({ createdAt: -1 });
        var serie;
        var correlativo;
        var n_venta;

        if (venta_last.length == 0) {
            serie = '001';
            correlativo = '000001';
            n_venta = serie + '-' + correlativo;
        } else {
            // >= 1 registro en venta
            var last_nventa = venta_last[0].nventa;
            var arr_nventa = last_nventa.split('-');

            if (arr_nventa[1] != '999999') {
                var new_correlativo = zfill(parseInt(arr_nventa[1]) + 1, 6);
                n_venta = arr_nventa[0] + '-' + new_correlativo;
            } else if (arr_nventa[1] == '999999') {
                var new_serie = zfill(parseInt(arr_nventa[0]) + 1, 3);
                n_venta = new_serie + '-000001';
            }
        }

        data.nventa = n_venta;
        data.estado = 'Procesando';
        data.userid = req.user.sub;

        console.log(data);

        let venta = await Venta.create(data);

        // Guardar alerta en base de datos (Módulo 15)
        await Notificacion.create({
            titulo: 'Nueva Orden Registrada',
            mensaje: 'Se ha registrado una nueva orden al mayor #' + venta.nventa + ' por valor de $' + venta.subtotal,
            tipo: 'pedido'
        });

        detalles.forEach(async element => {
            element.venta = venta._id;
            await Dventa.create(element);

            let element_producto = await Producto.findById({ _id: element.producto });
            let new_stock = element_producto.stock - element.cantidad;

            await Producto.findByIdAndUpdate({ _id: element.producto }, {
                stock: new_stock
            });

            //limpiar carrito
            await Carrito.deleteMany({ cliente: data.cliente });
            await CarritoAdmin.deleteMany({ cliente: data.cliente });
        });

        res.status(200).send({ venta: venta });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

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

const enviar_correo_compra_cliente = async function (req, res) {
    var id = req.params['id'];
    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //cliente _id fecha data subtotal

    var venta = await Venta.findById({ _id: id }).populate('cliente');
    var detalles = await Dventa.find({ venta: id }).populate('producto');

    var cliente = venta.cliente.nombres + ' ' + venta.cliente.apellidos;
    var _id = venta._id;
    var fecha = new Date(venta.createdAt);
    var data = detalles;
    var subtotal = venta.subtotal;
    var precio_envio = venta.envio_precio;

    readHTMLFile(process.cwd() + '/mail.html', (err, html) => {

        let rest_html = ejs.render(html, { data: data, cliente: cliente, _id: _id, fecha: fecha, subtotal: subtotal, precio_envio: precio_envio });

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({ op: true });

        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: venta.cliente.email,
            subject: 'Gracias por tu compra, Mi Tienda',
            html: htmlToSend
        };
        res.status(200).send({ data: true });
        transporter.sendMail(mailOptions, function (error, info) {
            if (!error) {
                console.log('Email sent: ' + info.response);
            }
        });

    });
}

const actualizar_estado_venta_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'asesora', 'direccion', 'compras', 'logistica', 'finanzas'].includes(req.user.role)) {
            var id = req.params['id'];
            var data = req.body;

            let venta = await Venta.findById(id);
            if (!venta) {
                return res.status(404).send({ message: 'Pedido no encontrado.' });
            }

            venta.estado = data.estado;
            if (data.notas_internas !== undefined) {
                venta.notas_internas = data.notas_internas;
            }

            venta.historial_estados.push({
                estado: data.estado,
                fecha: new Date(),
                responsable: req.user.email || 'Administrativo',
                motivo: data.motivo || 'Actualización de estado logística'
            });

            await venta.save();
            res.status(200).send({ data: venta });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_estado_detalle_venta_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'asesora', 'direccion', 'compras', 'logistica'].includes(req.user.role)) {
            try {
                var id = req.params['id'];
                var data = req.body;

                let dventa = await Dventa.findByIdAndUpdate(id, { estado: data.estado }, { new: true });
                res.status(200).send({ data: dventa });
            } catch (error) {
                res.status(500).send({ message: 'Error al actualizar prenda.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const subir_evidencia_pedido_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'logistica', 'direccion'].includes(req.user.role)) {
            try {
                var id = req.params['id'];
                let file = req.file;
                if (!file) {
                    return res.status(400).send({ message: 'Debe subir un archivo.' });
                }

                let venta = await Venta.findById(id);
                if (!venta) {
                    return res.status(404).send({ message: 'Pedido no encontrado' });
                }

                venta.evidencias.push(file.filename);
                await venta.save();

                res.status(200).send({ data: venta });
            } catch (error) {
                res.status(500).send({ message: 'Error al subir evidencia.', error: error.message });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_evidencia_archivo = async function (req, res) {
    var img = req.params['img'];

    fs.stat('./uploads/pedidos/' + img, function (err) {
        if (!err) {
            let path_img = './uploads/pedidos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/default.png';
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
}

const actualizar_abastecimiento_prenda_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'compras', 'direccion', 'asesora'].includes(req.user.role)) {
            try {
                var id = req.params['id'];
                var data = req.body;

                let updateData = {};
                if (data.proveedor !== undefined) updateData.proveedor = data.proveedor || null;
                if (data.costo_compra !== undefined) updateData.costo_compra = data.costo_compra;
                if (data.fecha_estimada_acopio !== undefined) updateData.fecha_estimada_acopio = data.fecha_estimada_acopio || null;
                if (data.estado !== undefined) updateData.estado = data.estado;

                let dventa = await Dventa.findByIdAndUpdate(id, updateData, { new: true }).populate('proveedor').populate('producto');
                res.status(200).send({ data: dventa });
            } catch (error) {
                res.status(500).send({ message: 'Error al actualizar abastecimiento de la prenda.', error: error.message });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_empaque_despacho_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'logistica', 'direccion'].includes(req.user.role)) {
            try {
                var id = req.params['id'];
                var data = req.body;

                let venta = await Venta.findById(id);
                if (!venta) {
                    return res.status(404).send({ message: 'Pedido no encontrado.' });
                }

                venta.peso_real = data.peso_real || 0;
                venta.dimensiones_alto = data.dimensiones_alto || 0;
                venta.dimensiones_ancho = data.dimensiones_ancho || 0;
                venta.dimensiones_largo = data.dimensiones_largo || 0;
                venta.ncajas = data.ncajas || 1;

                if (data.tracking_fedex) {
                    venta.tracking_fedex = data.tracking_fedex;
                    venta.estado = 'Entregado a FedEx';
                } else {
                    venta.estado = 'Listo para despacho';
                }

                venta.historial_estados.push({
                    estado: venta.estado,
                    fecha: new Date(),
                    responsable: req.user.email || 'Logística',
                    motivo: data.tracking_fedex
                        ? 'Empaque finalizado y entregado a FedEx con Guía: ' + data.tracking_fedex
                        : 'Empaque y pesaje finalizado. Listo para retirar por Courier.'
                });

                await venta.save();
                res.status(200).send({ data: venta });
            } catch (error) {
                res.status(500).send({ message: 'Error al actualizar empaque del pedido.', error: error.message });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_pedido_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {
            var id = req.params['id'];
            var data = req.body;
            var detalles = data.detalles;

            // 1. Obtener detalles antiguos
            let old_details = await Dventa.find({ venta: id });

            // 2. Devolver stock anterior
            for (var item of old_details) {
                let element_producto = await Producto.findById({ _id: item.producto });
                if (element_producto) {
                    let new_stock = parseInt(element_producto.stock) + parseInt(item.cantidad);
                    await Producto.findByIdAndUpdate({ _id: item.producto }, {
                        stock: new_stock
                    });
                }
            }

            // 3. Eliminar detalles antiguos
            await Dventa.deleteMany({ venta: id });

            // 4. Crear nuevos detalles y deducir stock
            for (var element of detalles) {
                element.venta = id;
                await Dventa.create(element);

                let element_producto = await Producto.findById({ _id: element.producto });
                if (element_producto) {
                    let new_stock = parseInt(element_producto.stock) - parseInt(element.cantidad);
                    await Producto.findByIdAndUpdate({ _id: element.producto }, {
                        stock: new_stock
                    });
                }
            }

            // 5. Actualizar la Venta principal
            let updatedVenta = await Venta.findByIdAndUpdate({ _id: id }, {
                subtotal: data.subtotal,
                direccion: data.direccion,
                nota: data.nota || '',
                transaccion: data.transaccion,
                envio_titulo: data.envio_titulo,
                envio_precio: data.envio_precio,
                userid: req.user.sub
            }, { new: true });

            res.status(200).send({ data: updatedVenta });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registrar_escala_transito_admin = async function (req, res) {
        if (req.user) {
            if (['admin', 'logistica', 'direccion'].includes(req.user.role)) {
                try {
                    var id = req.params['id'];
                    var data = req.body;

                    let venta = await Venta.findById(id);
                    if (!venta) {
                        return res.status(404).send({ message: 'Pedido no encontrado.' });
                    }

                    if (data.estado && data.ubicacion) {
                        venta.historial_transito_fedex.push({
                            estado: data.estado,
                            ubicacion: data.ubicacion,
                            fecha: new Date(),
                            descripcion: data.descripcion || ''
                        });
                    }

                    if (data.alerta_novedad_envio !== undefined) {
                        venta.alerta_novedad_envio = data.alerta_novedad_envio || null;
                    }

                    await venta.save();
                    res.status(200).send({ data: venta });
                } catch (error) {
                    res.status(500).send({ message: 'Error al registrar escala de tránsito.', error: error.message });
                }
            } else {
                res.status(500).send({ message: 'NoAccess' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    }

    const obtener_balance_financiero_admin = async function (req, res) {
        if (req.user) {
            if (['admin', 'finanzas', 'direccion'].includes(req.user.role)) {
                try {
                    let desde = req.params['desde'];
                    let hasta = req.params['hasta'];

                    let query = {};
                    if (desde && hasta && desde !== 'undefined' && hasta !== 'undefined') {
                        query.createdAt = {
                            $gte: new Date(desde + 'T00:00:00.000Z'),
                            $lte: new Date(hasta + 'T23:59:59.999Z')
                        };
                    }

                    let ventas = await Venta.find(query).populate('cliente').sort({ createdAt: -1 });
                    let computedVentas = [];

                    let total_ingresos = 0;
                    let total_confeccion = 0;
                    let total_comisiones_pasarela = 0;
                    let total_comisiones_asesora = 0;
                    let total_envio = 0;
                    let total_utilidad_neta = 0;

                    for (let venta of ventas) {
                        let detalles = await Dventa.find({ venta: venta._id });
                        let costo_confeccion = 0;
                        detalles.forEach(d => {
                            costo_confeccion += (d.costo_compra || 0) * d.cantidad;
                        });

                        let comision_pasarela = 0;
                        let metodo_pago = venta.transaccion || 'Transferencia';

                        if (metodo_pago.toLowerCase().includes('paypal')) {
                            comision_pasarela = (venta.subtotal * 0.054) + 0.30;
                        } else if (metodo_pago.toLowerCase().includes('culqi')) {
                            comision_pasarela = (venta.subtotal * 0.042) + 0.30;
                        }

                        let comision_asesora = (venta.subtotal * 0.05);
                        let envio_precio = venta.envio_precio || 0;
                        let utilidad_neta = venta.subtotal - costo_confeccion - comision_pasarela - comision_asesora;

                        total_ingresos += venta.subtotal;
                        total_confeccion += costo_confeccion;
                        total_comisiones_pasarela += comision_pasarela;
                        total_comisiones_asesora += comision_asesora;
                        total_envio += envio_precio;
                        total_utilidad_neta += utilidad_neta;

                        computedVentas.push({
                            _id: venta._id,
                            nventa: venta.nventa,
                            cliente: venta.cliente ? (venta.cliente.nombres + ' ' + venta.cliente.apellidos) : 'Invitado',
                            createdAt: venta.createdAt,
                            subtotal: venta.subtotal,
                            envio_precio: envio_precio,
                            transaccion: venta.transaccion,
                            trm_aplicada: venta.trm_aplicada || 4000,
                            costo_confeccion: costo_confeccion,
                            comision_pasarela: comision_pasarela,
                            comision_asesora: comision_asesora,
                            utilidad_neta: utilidad_neta
                        });
                    }

                    res.status(200).send({
                        data: computedVentas,
                        aggregates: {
                            total_ingresos,
                            total_confeccion,
                            total_comisiones_pasarela,
                            total_comisiones_asesora,
                            total_envio,
                            total_utilidad_neta
                        }
                    });
                } catch (error) {
                    res.status(500).send({ message: 'Error al generar balance financiero.', error: error.message });
                }
            } else {
                res.status(500).send({ message: 'NoAccess' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    }

    const actualizar_trm_pedido_admin = async function (req, res) {
        if (req.user) {
            if (['admin', 'finanzas', 'direccion'].includes(req.user.role)) {
                try {
                    let id = req.params['id'];
                    let data = req.body;

                    let venta = await Venta.findByIdAndUpdate(id, { trm_aplicada: data.trm_aplicada }, { new: true });
                    res.status(200).send({ data: venta });
                } catch (error) {
                    res.status(500).send({ message: 'Error al actualizar TRM.' });
                }
            } else {
                res.status(500).send({ message: 'NoAccess' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    }

module.exports = {
    registro_compra_cliente,
    enviar_correo_compra_cliente,
    actualizar_estado_venta_admin,
    actualizar_pedido_admin,
    actualizar_estado_detalle_venta_admin,
    subir_evidencia_pedido_admin,
    obtener_evidencia_archivo,
    actualizar_abastecimiento_prenda_admin,
    actualizar_empaque_despacho_admin,
    registrar_escala_transito_admin,
    obtener_balance_financiero_admin,
    actualizar_trm_pedido_admin
}