'use strict'

const Carrito = require('../models/carrito');
const Descuento = require('../models/descuento');
const Cupon = require('../models/cupon');

const getPayPalBaseUrl = () => {
    return process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
};

const getPayPalAccessToken = async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const baseUrl = getPayPalBaseUrl();
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayPal Auth Error: ${errText}`);
    }
    
    const data = await response.json();
    return data.access_token;
};

const calcular_monto_carrito_seguro = async (clienteId, cuponCodigo, envioPrecio) => {
    let carrito_arr = await Carrito.find({ cliente: clienteId }).populate('producto');
    let subtotal = 0;
    
    let descuentos = await Descuento.find().sort({createdAt:-1});
    let descuento_activo = undefined;
    let today = Date.parse(new Date().toString())/1000;
    for (let element of descuentos) {
        let tt_inicio = Date.parse(element.fecha_inicio+"T00:00:00")/1000;
        let tt_fin = Date.parse(element.fecha_fin+"T23:59:59")/1000;
        if(today >= tt_inicio && today <= tt_fin){
            descuento_activo = element;
            break;
        }
    }
    
    if (descuento_activo === undefined) {
        carrito_arr.forEach(element => {
            subtotal += parseInt(element.producto.precio);
        });
    } else {
        carrito_arr.forEach(element => {
            let new_precio = Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio) * descuento_activo.descuento) / 100);
            subtotal += new_precio;
        });
    }
    
    let total = subtotal;
    
    if (cuponCodigo) {
        let cupon = await Cupon.findOne({ codigo: cuponCodigo });
        if (cupon && cupon.codigo.length <= 25) {
            if (cupon.tipo === 'Valor fijo') {
                total = total - cupon.valor;
            } else if (cupon.tipo === 'Porcentaje') {
                total = total - (total * cupon.valor) / 100;
            }
        }
    }
    
    if (envioPrecio) {
        total += parseInt(envioPrecio);
    }
    
    return total;
};

const obtener_paypal_client_id = async function(req, res) {
    res.status(200).send({ clientId: process.env.PAYPAL_CLIENT_ID });
};

const crear_orden_paypal = async function(req, res) {
    if (req.user) {
        try {
            const clienteId = req.user.sub;
            const { cupon, envio_precio } = req.body;
            
            const total = await calcular_monto_carrito_seguro(clienteId, cupon, envio_precio);
            
            const accessToken = await getPayPalAccessToken();
            const baseUrl = getPayPalBaseUrl();
            
            const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: total.toString()
                        }
                    }]
                })
            });
            
            if (!response.ok) {
                const errText = await response.text();
                return res.status(500).send({ message: 'Error al crear orden en PayPal', error: errText });
            }
            
            const order = await response.json();
            res.status(200).send({ orderID: order.id });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error interno del servidor', error: error.message });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

const capturar_orden_paypal = async function(req, res) {
    if (req.user) {
        try {
            const { orderID } = req.body;
            if (!orderID) {
                return res.status(400).send({ message: 'Falta el ID de orden' });
            }
            
            const accessToken = await getPayPalAccessToken();
            const baseUrl = getPayPalBaseUrl();
            
            const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errText = await response.text();
                return res.status(500).send({ message: 'Error al capturar orden en PayPal', error: errText });
            }
            
            const captureData = await response.json();
            res.status(200).send({ captureData });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error interno al capturar orden', error: error.message });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

module.exports = {
    obtener_paypal_client_id,
    crear_orden_paypal,
    capturar_orden_paypal
};
