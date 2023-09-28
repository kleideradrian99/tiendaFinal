var CarritoAdmin = require('../models/carritoAdmin');

const agregar_al_carrito = async function (req, res) {
    try {
        if (req.user) {
            let data = req.body;
            // Validar por cliente producto y orden
            let carritoClienteAdmin = await CarritoAdmin.find({
                cliente: data.cliente,
                producto: data.producto
            });
            if (carritoClienteAdmin.length == 0) {
                let reg = await CarritoAdmin.create(
                    {
                        variedad: data.variedad,
                        producto: data.producto,
                        cliente: data.cliente,
                        total: data.total,
                        observacion: data.observacion
                    });
                res.status(200).send({ data: reg });
            } else {
                res.status(200).send({ data: undefined });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_carrito_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let carrito_admin = await CarritoAdmin.find({ cliente: id }).populate('producto');
        res.status(200).send({ data: carrito_admin });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_ordenes = async function (req, res) {
    if (req.user) {
        let ordenes = await CarritoAdmin.find();
        console.log(ordenes)
        res.status(200).send({ data: ordenes });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_carrito_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let reg = await CarritoAdmin.findByIdAndRemove({ _id: id });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    agregar_al_carrito,
    obtener_carrito_admin,
    eliminar_carrito_admin,
    obtener_ordenes
}