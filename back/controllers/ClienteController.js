'use strict'

var Cliente = require('../models/cliente');
var Venta = require('../models/venta');
var Dventa = require('../models/dventa');
var Contacto = require('../models/contacto');
var Review = require('../models/review');
var bcrypt = require('bcryptjs');
var jwt = require('../helpers/jwt');
var jsonwebtoken = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var Direccion = require('../models/direccion');

const registro_cliente = async function (req, res) {
    var data = req.body;
    var clientes_arr = [];

    if (!data.telefono) {
        return res.status(200).send({ message: 'El número de teléfono es obligatorio', data: undefined });
    }

    clientes_arr = await Cliente.find({ telefono: data.telefono });

    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, 10, async function (err, hash) {
                if (hash) {
                    data.password = hash;
                    var reg = await Cliente.create(data);
                    res.status(200).send({
                        data: reg,
                        token: jwt.createToken(reg)
                    });
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'El número de teléfono ya existe en la base de datos', data: undefined });
    }
}

const login_cliente = async function (req, res) {
    var data = req.body;
    var cliente_arr = [];

    if (!data.telefono) {
        return res.status(200).send({ message: 'El número de teléfono es obligatorio', data: undefined });
    }

    cliente_arr = await Cliente.find({ telefono: data.telefono });

    if (cliente_arr.length == 0) {
        res.status(200).send({ message: 'No se encontró el número de teléfono', data: undefined });
    } else {
        //LOGIN
        let user = cliente_arr[0];

        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {
                res.status(200).send({
                    data: user,
                    token: jwt.createToken(user)
                });
            } else {
                res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
            }
        });

    }
}
const obtener_direccion_principal_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var direccion = undefined;

        direccion = await Direccion.findOne({ cliente: id, principal: true });

        if (direccion == undefined) {
            res.status(200).send({ data: undefined });
        } else {
            res.status(200).send({ data: direccion });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_clientes_filtro_admin = async function (req, res) {
    // console.log(req.user);
    if (req.user) {
        if (req.user.role == 'admin') {
            let tipo = req.params['tipo'];
            let filtro = req.params['filtro'];

            if (tipo == null || tipo == 'null') {
                let reg = await Cliente.find();
                res.status(200).send({ data: reg });
            } else {
                if (tipo == 'apellidos') {
                    let reg = await Cliente.find({ apellidos: new RegExp(filtro, 'i') });
                    res.status(200).send({ data: reg });

                } else if (tipo == 'correo') {
                    let reg = await Cliente.find({ email: new RegExp(filtro, 'i') });
                    res.status(200).send({ data: reg });
                }
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }


}

const registro_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {
            var data = req.body;

            if (!data.telefono) {
                return res.status(200).send({ message: 'El número de teléfono es obligatorio', data: undefined });
            }

            var clientes_arr = await Cliente.find({ telefono: data.telefono });
            if (clientes_arr.length > 0) {
                return res.status(200).send({ message: 'El número de teléfono ya existe', data: undefined });
            }

            bcrypt.hash('123456789', 10, async function (err, hash) {
                if (hash) {
                    data.password = hash;
                    let reg = await Cliente.create(data);
                    res.status(200).send({ data: reg });
                } else {
                    res.status(200).send({ message: 'Hubo un error en el servidor', data: undefined });
                }
            })

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {
            var id = req.params['id'];
            try {
                var reg = await Cliente.findById({ _id: id });

                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_cliente = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {
            var filtro = req.params['filtro'];
            let reg = await Cliente.find({
                $or: [
                    { dni: new RegExp(filtro, 'i') },
                    { nombres: new RegExp(filtro, 'i') },
                    { apellidos: new RegExp(filtro, 'i') },
                    { email: new RegExp(filtro, 'i') }
                ]
            });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actulizar_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {

            var id = req.params['id'];
            var data = req.body;


            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                email: data.email,
                telefono: data.telefono,
                f_nacimiento: data.f_nacimiento,
                dni: data.dni,
                genero: data.genero
            })
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {

            var id = req.params['id'];

            let reg = await Cliente.findByIdAndDelete(id);
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Cliente.findById({ _id: id });

            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_perfil_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var data = req.body;

        console.log(data.password);

        if (data.password) {
            console.log('Con contraseña');
            bcrypt.hash(data.password, 10, async function (err, hash) {
                console.log(hash);
                var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    telefono: data.telefono,
                    f_nacimiento: data.f_nacimiento,
                    dni: data.dni,
                    genero: data.genero,
                    pais: data.pais,
                    password: hash,
                });
                res.status(200).send({ data: reg });
            });

        } else {
            console.log('Sin contraseña');
            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                telefono: data.telefono,
                f_nacimiento: data.f_nacimiento,
                dni: data.dni,
                genero: data.genero,
                pais: data.pais,
            });
            res.status(200).send({ data: reg });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/**ORDENES */
const obtener_ordenes_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await Venta.find({ cliente: id }).sort({ createdAt: -1 });
        if (reg.length >= 1) {
            res.status(200).send({ data: reg });
        } else if (reg.length == 0) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_detalles_ordenes_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            let venta = await Venta.findById({ _id: id }).populate('direccion').populate('cliente');
            let detalles = await Dventa.find({ venta: id }).populate('producto');

            res.status(200).send({ data: venta, detalles: detalles });

        } catch (error) {
            res.status(200).send({ data: undefined });
        }



    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


/********************************************************* */
//DiRECIONES


const registro_direccion_cliente = async function (req, res) {
    if (req.user) {
        var data = req.body;

        if (data.principal) {
            let direcciones = await Direccion.find({ cliente: data.cliente });

            direcciones.forEach(async element => {
                await Direccion.findByIdAndUpdate({ _id: element._id }, { principal: false });
            });
        }


        let reg = await Direccion.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_direccion_todos_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let direcciones = await Direccion.find({ cliente: id }).populate('cliente').sort({ createdAt: -1 });
        res.status(200).send({ data: direcciones });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const cambiar_direccion_principal_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var cliente = req.params['cliente'];

        let direcciones = await Direccion.find({ cliente: cliente });

        direcciones.forEach(async element => {
            await Direccion.findByIdAndUpdate({ _id: element._id }, { principal: false });
        });

        await Direccion.findByIdAndUpdate({ _id: id }, { principal: true });

        res.status(200).send({ data: true });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/********************************CONTACTO */
const enviar_mensaje_contacto = async function (req, res) {
    let data = req.body;

    data.estado = 'Abierto';
    let reg = await Contacto.create(data);
    res.status(200).send({ data: reg });

}

/**REVIEWS */
const emitir_review_producto_cliente = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let reg = await Review.create(data);
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_review_producto_cliente = async function (req, res) {
    let id = req.params['id'];

    let reg = await Review.find({ producto: id }).sort({ createdAt: -1 });
    res.status(200).send({ data: reg });
}
///////////////////////////////////////////////////////////////////////////////////////////////////
const obtener_reviews_cliente = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];

        let reg = await Review.find({ cliente: id }).populate('cliente');
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const enviar_recuperacion_cliente = async function(req,res){
    var data = req.body;
    var cliente = await Cliente.findOne({email:data.email});

    if(!cliente){
        return res.status(200).send({message: 'No se encontró el correo', data: undefined});
    }

    var secret = process.env.JWT_SECRET;
    var resetToken = jsonwebtoken.sign({
        sub: cliente._id,
        email: cliente.email,
        type: 'reset_cliente'
    }, secret, { expiresIn: '1h' });

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    var resetLink = (process.env.TIENDA_URL || 'http://localhost:4202') + '/restablecer-contrasena/' + resetToken;

    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: cliente.email,
        subject: 'Recuperación de Contraseña - LATAM MODA',
        html: `<p>Hola ${cliente.nombres},</p>
               <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para ingresar una nueva clave:</p>
               <p><a href="${resetLink}">${resetLink}</a></p>
               <p>Este enlace expirará en 1 hora.</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return res.status(200).send({message: 'Error al enviar el correo', data: false});
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).send({data: true});
        }
    });
}

const restablecer_contrasena_cliente = async function(req,res){
    var data = req.body;
    var token = data.token;
    var password = data.password;

    try {
        var secret = process.env.JWT_SECRET;
        var payload = jsonwebtoken.verify(token, secret);
        if(payload.type !== 'reset_cliente'){
            return res.status(200).send({message: 'Token no válido', data: false});
        }

        bcrypt.hash(password, 10, async function(err,hash){
            if(hash){
                await Cliente.findByIdAndUpdate({_id: payload.sub}, {password: hash});
                res.status(200).send({data: true});
            }else{
                res.status(200).send({message:'ErrorServer',data:false});
            }
        });
    } catch (error) {
        res.status(200).send({message: 'Token expirado o no válido', data: false});
    }
}

module.exports = {
    registro_cliente,
    login_cliente,
    listar_clientes_filtro_admin,
    registro_cliente_admin,
    obtener_cliente_admin,
    actulizar_cliente_admin,
    eliminar_cliente_admin,
    obtener_cliente_guest,
    actualizar_perfil_cliente_guest,
    registro_direccion_cliente,
    obtener_direccion_principal_cliente,
    obtener_direccion_todos_cliente,
    cambiar_direccion_principal_cliente,
    enviar_mensaje_contacto,
    obtener_ordenes_cliente,
    obtener_detalles_ordenes_cliente,
    emitir_review_producto_cliente,
    obtener_review_producto_cliente,
    obtener_reviews_cliente,
    obtener_cliente,
    enviar_recuperacion_cliente,
    restablecer_contrasena_cliente
}
