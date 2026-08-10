'use strict'

var MensajeChat = require('../models/mensaje_chat');
var Cliente = require('../models/cliente');
var Notificacion = require('../models/notificacion');

const enviar_mensaje_cliente = async function (req, res) {
    if (req.user) {
        let clienteId = req.user.sub;
        let data = req.body;

        try {
            // Obtener el cliente para ver si tiene asesor
            let cliente = await Cliente.findById(clienteId);
            let adminId = cliente ? cliente.asesor : null;

            let reg = await MensajeChat.create({
                cliente: clienteId,
                asesor: adminId,
                remitente: 'cliente',
                mensaje: data.mensaje,
                adjunto: data.adjunto || null,
                leido: false
            });

            // Guardar notificación persistente (Módulo 15)
            await Notificacion.create({
                titulo: 'Nuevo mensaje de chat',
                mensaje: (cliente ? (cliente.nombres + ' ' + (cliente.apellidos || '')) : 'Cliente') + ' te ha enviado un mensaje de chat.',
                usuario: adminId || null,
                tipo: 'chat'
            });

            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const enviar_mensaje_asesor = async function (req, res) {
    if (req.user) {
        if (['admin', 'vendedor', 'direccion', 'asesora', 'soporte'].includes(req.user.role)) {
            let adminId = req.user.sub;
            let data = req.body;

            try {
                let reg = await MensajeChat.create({
                    cliente: data.cliente,
                    asesor: adminId,
                    remitente: 'asesor',
                    mensaje: data.mensaje,
                    adjunto: data.adjunto || null,
                    leido: false
                });

                // Auto-asignar asesor al cliente si no tiene uno
                await Cliente.findByIdAndUpdate(data.cliente, {
                    asesor: adminId
                });

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

const listar_mensajes_cliente = async function (req, res) {
    if (req.user) {
        let clienteId = req.user.sub;

        try {
            // Marcar como leídos los mensajes que envió el asesor al cliente
            await MensajeChat.updateMany(
                { cliente: clienteId, remitente: 'asesor', leido: false },
                { leido: true }
            );

            let mensajes = await MensajeChat.find({ cliente: clienteId })
                .sort({ createdAt: 1 })
                .populate('asesor', 'nombres apellidos email');

            res.status(200).send({ data: mensajes });
        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_mensajes_asesor = async function (req, res) {
    if (req.user) {
        if (['admin', 'vendedor', 'direccion', 'asesora', 'soporte'].includes(req.user.role)) {
            let clienteId = req.params['clienteId'];

            try {
                // Marcar como leídos los mensajes que envió el cliente
                await MensajeChat.updateMany(
                    { cliente: clienteId, remitente: 'cliente', leido: false },
                    { leido: true }
                );

                let mensajes = await MensajeChat.find({ cliente: clienteId })
                    .sort({ createdAt: 1 });

                res.status(200).send({ data: mensajes });
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

const listar_conversaciones_asesor = async function (req, res) {
    if (req.user) {
        if (['admin', 'vendedor', 'direccion', 'asesora', 'soporte'].includes(req.user.role)) {
            try {
                // Buscar todos los mensajes ordenados por fecha descendente
                let mensajes = await MensajeChat.find().sort({ createdAt: -1 });

                let clientIds = [];
                let chatList = [];

                for (let msg of mensajes) {
                    if (msg.cliente && !clientIds.includes(msg.cliente.toString())) {
                        clientIds.push(msg.cliente.toString());

                        let cli = await Cliente.findById(msg.cliente);
                        if (cli) {
                            if (req.user.role === 'asesora' && (!cli.asesor || cli.asesor.toString() !== req.user.sub.toString())) {
                                continue;
                            }
                            let unreadCount = await MensajeChat.countDocuments({
                                cliente: msg.cliente,
                                remitente: 'cliente',
                                leido: false
                            });

                            chatList.push({
                                cliente: {
                                    _id: cli._id,
                                    nombres: cli.nombres,
                                    apellidos: cli.apellidos || '',
                                    email: cli.email,
                                    telefono: cli.telefono,
                                    perfil: cli.perfil
                                },
                                ultimo_mensaje: msg.mensaje,
                                ultimo_remitente: msg.remitente,
                                fecha: msg.createdAt,
                                unread: unreadCount
                            });
                        }
                    }
                }

                res.status(200).send({ data: chatList });
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

module.exports = {
    enviar_mensaje_cliente,
    enviar_mensaje_asesor,
    listar_mensajes_cliente,
    listar_mensajes_asesor,
    listar_conversaciones_asesor
}
