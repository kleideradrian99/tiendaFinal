'use strict'

var Proforma = require('../models/proforma');
var Producto = require('../models/producto');
var Carrito = require('../models/carrito');
var Venta = require('../models/venta');
var Dventa = require('../models/dventa');
var FedexTarifarioController = require('./FedexTarifarioController');

function zfill(number, width) {
    var numberOutput = Math.abs(number).toString();
    var zero = "0";
    var length = numberOutput.length;
    if (width - length > 0) {
        return zero.repeat(width - length) + numberOutput;
    }
    return numberOutput;
}

const solicitar_proforma_cliente = async function (req, res) {
    if (req.user) {
        let clienteId = req.user.sub;
        let data = req.body; // Puede incluir observaciones_cliente

        try {
            // 1. Obtener items del carrito
            let carrito_items = await Carrito.find({ cliente: clienteId }).populate('producto');
            if (carrito_items.length === 0) {
                return res.status(400).send({ message: 'El carrito está vacío' });
            }

            // 2. Calcular subtotal, peso total y detalles
            let subtotal = 0;
            let peso_total = 0;
            let detalles = [];

            for (let item of carrito_items) {
                let item_subtotal = item.producto.precio * item.cantidad;
                subtotal += item_subtotal;
                peso_total += (item.producto.peso || 0) * item.cantidad;

                detalles.push({
                    producto: item.producto._id,
                    variedad: item.variedad,
                    cantidad: item.cantidad,
                    precio_unitario: item.producto.precio,
                    subtotal: item_subtotal
                });
            }

            // 3. Consultar FedEx Tarifario
            let Direccion = require('../models/direccion');
            let direccion_cli = null;
            if (data.direccionId) {
                direccion_cli = await Direccion.findById({ _id: data.direccionId });
            }
            if (!direccion_cli) {
                direccion_cli = await Direccion.findOne({ cliente: clienteId, principal: true });
            }
            let pais_envio = direccion_cli ? direccion_cli.pais : "Estados Unidos";

            let envio_precio = await FedexTarifarioController.obtener_tarifa_por_peso(peso_total, pais_envio);

            // 4. Estimar impuestos (por defecto 5% del subtotal)
            let impuestos = Math.round(subtotal * 0.05);

            let total = subtotal + envio_precio + impuestos;

            // 5. Generar número correlativo PRF-000001
            let proforma_last = await Proforma.find().sort({ createdAt: -1 });
            let n_proforma = 'PRF-000001';

            if (proforma_last.length > 0) {
                let last_n = proforma_last[0].nproforma;
                let num = parseInt(last_n.split('-')[1]);
                n_proforma = 'PRF-' + zfill(num + 1, 6);
            }

            // 6. Registrar Proforma
            let proforma = await Proforma.create({
                nproforma: n_proforma,
                cliente: clienteId,
                detalles: detalles,
                subtotal: subtotal,
                peso_total: peso_total,
                envio_precio: envio_precio,
                impuestos: impuestos,
                total: total,
                estado: 'Pendiente',
                direccion: direccion_cli ? direccion_cli._id : null,
                observaciones_cliente: data.observaciones_cliente || ''
            });

            // 7. Vaciar carrito del cliente
            await Carrito.deleteMany({ cliente: clienteId });

            res.status(200).send({ data: proforma });

        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_proformas_cliente = async function (req, res) {
    if (req.user) {
        let clienteId = req.user.sub;
        try {
            let reg = await Proforma.find({ cliente: clienteId }).sort({ createdAt: -1 });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_detalle_proforma_cliente = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        try {
            let reg = await Proforma.findById({ _id: id }).populate('detalles.producto');
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_proformas_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'asesora', 'direccion', 'finanzas'].includes(req.user.role)) {
            try {
                let reg = await Proforma.find().populate('cliente').sort({ createdAt: -1 });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error en el servidor', error: error });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_proforma_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'asesora', 'direccion'].includes(req.user.role)) {
            let id = req.params['id'];
            let data = req.body;

            try {
                // Calcular total recalculado si se modificaron valores
                let subtotal = parseFloat(data.subtotal) || 0;
                let envio_precio = parseFloat(data.envio_precio) || 0;
                let impuestos = parseFloat(data.impuestos) || 0;
                let total = subtotal + envio_precio + impuestos;

                let reg = await Proforma.findByIdAndUpdate({ _id: id }, {
                    detalles: data.detalles,
                    subtotal: subtotal,
                    envio_precio: envio_precio,
                    impuestos: impuestos,
                    total: total,
                    estado: data.estado, // Pendiente, Aprobada, Rechazada
                    observaciones_asesor: data.observaciones_asesor || '',
                    asesor: req.user.sub
                }, { new: true });

                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error en el servidor', error: error });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

// Convertir proforma aprobada en compra (Venta)
const procesar_proforma_venta = async function (req, res) {
    if (req.user) {
        let data = req.body; // Requiere id de la proforma
        try {
            let proforma = await Proforma.findById({ _id: data.proformaId }).populate('detalles.producto');
            if (!proforma || proforma.estado !== 'Aprobada') {
                return res.status(400).send({ message: 'La proforma no está aprobada o no existe' });
            }

            // Generar número correlativo Venta
            let venta_last = await Venta.find().sort({ createdAt: -1 });
            let serie = '001';
            let correlativo = '000001';
            let n_venta = serie + '-' + correlativo;

            if (venta_last.length > 0) {
                let last_n = venta_last[0].nventa;
                let arr = last_n.split('-');
                if (arr[1] !== '999999') {
                    n_venta = arr[0] + '-' + zfill(parseInt(arr[1]) + 1, 6);
                } else {
                    n_venta = zfill(parseInt(arr[0]) + 1, 3) + '-000001';
                }
            }

            // Crear registro de Venta
            let venta = await Venta.create({
                cliente: proforma.cliente,
                nventa: n_venta,
                subtotal: proforma.subtotal,
                envio_precio: proforma.envio_precio,
                envio_titulo: 'FedEx Express International',
                direccion: data.direccionId || proforma.direccion,
                nota: proforma.observaciones_cliente || '',
                transaccion: data.transaccion || 'PROFORMA DIRECTO',
                estado: 'Procesando',
                valor_neto: proforma.total // total neto cobrado
            });

            // Registrar detalles de venta y descontar stock
            for (let detail of proforma.detalles) {
                await Dventa.create({
                    producto: detail.producto._id,
                    variedad: detail.variedad,
                    cantidad: detail.cantidad,
                    subtotal: detail.subtotal,
                    venta: venta._id,
                    cliente: proforma.cliente
                });

                // Deducir stock
                let prod = await Producto.findById({ _id: detail.producto._id });
                if (prod) {
                    let new_stock = parseInt(prod.stock || 0) - parseInt(detail.cantidad);
                    await Producto.findByIdAndUpdate({ _id: detail.producto._id }, { stock: new_stock });
                }
            }

            // Actualizar estado de proforma a Procesada
            await Proforma.findByIdAndUpdate({ _id: data.proformaId }, { estado: 'Procesada' });

            res.status(200).send({ data: venta });

        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    solicitar_proforma_cliente,
    listar_proformas_cliente,
    obtener_detalle_proforma_cliente,
    listar_proformas_admin,
    actualizar_proforma_admin,
    procesar_proforma_venta
}
