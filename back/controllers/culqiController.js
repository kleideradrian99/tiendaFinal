'use strict'

const obtener_public_key = async function(req, res) {
    res.status(200).send({ publicKey: process.env.CULQI_PUBLIC_KEY });
};

const crear_cargo = async function(req, res) {
    if (req.user) {
        try {
            const { amount, currency_code, email, source_id } = req.body;
            
            if (!amount || !currency_code || !email || !source_id) {
                return res.status(400).send({ message: 'Faltan parámetros requeridos para el cargo.' });
            }

            const response = await fetch('https://api.culqi.com/v2/charges', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    currency_code,
                    email,
                    source_id
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error("Error from Culqi API:", data);
                return res.status(response.status).send({ message: 'Error al procesar cargo en Culqi', error: data });
            }

            res.status(200).send(data);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error interno del servidor', error: error.message });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

module.exports = {
    obtener_public_key,
    crear_cargo
};
