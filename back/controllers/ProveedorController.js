'use strict'

var Proveedor = require('../models/proveedor');

const registro_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'compras', 'direccion'].includes(req.user.role)) {
            var data = req.body;
            try {
                let reg = await Proveedor.create(data);
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error al registrar proveedor.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_proveedores_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'compras', 'direccion', 'finanzas'].includes(req.user.role)) {
            try {
                let reg = await Proveedor.find().sort({ razon_social: 1 });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error al listar proveedores.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'compras', 'direccion'].includes(req.user.role)) {
            var id = req.params['id'];
            try {
                let reg = await Proveedor.findById(id);
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error al obtener proveedor.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'compras', 'direccion'].includes(req.user.role)) {
            var id = req.params['id'];
            var data = req.body;
            try {
                let reg = await Proveedor.findByIdAndUpdate(id, {
                    razon_social: data.razon_social,
                    contacto: data.contacto,
                    telefono: data.telefono,
                    email: data.email
                }, { new: true });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error al actualizar proveedor.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'compras', 'direccion'].includes(req.user.role)) {
            var id = req.params['id'];
            try {
                let reg = await Proveedor.findByIdAndRemove(id);
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error al eliminar proveedor.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    registro_proveedor_admin,
    listar_proveedores_admin,
    obtener_proveedor_admin,
    actualizar_proveedor_admin,
    eliminar_proveedor_admin
}
