'use strict'

var FedexTarifario = require('../models/fedex_tarifario');

// Mapa de Países a Zonas de Envío de FedEx
const MAPA_ZONAS = {
    "Estados Unidos": "A",
    "México": "B",
    "Colombia": "C",
    "Perú": "C",
    "Ecuador": "C",
    "Venezuela": "C",
    "Bolivia": "C",
    "Chile": "C",
    "Argentina": "C",
    "Brasil": "C",
    "Uruguay": "C",
    "Paraguay": "C",
    "Panamá": "D",
    "Costa Rica": "D",
    "Guatemala": "D",
    "El Salvador": "D",
    "Honduras": "D",
    "Nicaragua": "D",
    "República Dominicana": "D",
    "Cuba": "D",
    "Haití": "D",
    "España": "E"
};

const registro_tarifario_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'logistica'].includes(req.user.role)) {
            let data = req.body;
            try {
                let reg = await FedexTarifario.create(data);
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

const listar_tarifarios_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'logistica'].includes(req.user.role)) {
            try {
                let reg = await FedexTarifario.find().sort({ peso: 1 });
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

const eliminar_tarifario_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'logistica'].includes(req.user.role)) {
            let id = req.params['id'];
            try {
                let reg = await FedexTarifario.findByIdAndDelete({ _id: id });
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

// Helper para uso interno de cotizaciones/proformas
const obtener_tarifa_por_peso = async function (peso, pais) {
    try {
        let zona = MAPA_ZONAS[pais] || "A";
        // Encontrar el primer rango de peso mayor o igual al peso calculado
        let tarifa = await FedexTarifario.findOne({
            peso: { $gte: peso }
        }).sort({ peso: 1 });

        if (!tarifa) {
            // Si supera el peso máximo de la tabla, usar el costo del peso máximo
            tarifa = await FedexTarifario.findOne().sort({ peso: -1 });
        }

        if (tarifa) {
            return tarifa[zona] || tarifa["A"] || 0;
        }
        return 0;
    } catch (error) {
        return 0;
    }
}

const obtener_tarifa_envio_cliente = async function (req, res) {
    if (req.user) {
        let peso = parseFloat(req.params['peso']) || 0;
        let pais = req.params['pais'] || "Estados Unidos";
        try {
            let precio = await obtener_tarifa_por_peso(peso, pais);
            res.status(200).send({ precio: precio });
        } catch (error) {
            res.status(500).send({ message: 'Error en el servidor', error: error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    registro_tarifario_admin,
    listar_tarifarios_admin,
    eliminar_tarifario_admin,
    obtener_tarifa_por_peso,
    obtener_tarifa_envio_cliente
}
