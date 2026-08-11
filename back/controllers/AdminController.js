'use strict'

var Admin = require('../models/admin');
var Venta = require('../models/venta');
var Dventa = require('../models/dventa');

var Contacto = require('../models/contacto');
var bcrypt = require('bcryptjs');
var jwt = require('../helpers/jwt');
var jsonwebtoken = require('jsonwebtoken');
var nodemailer = require('nodemailer');

const registro_admin = async function(req,res){
    //
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({email:data.email});

    if(admin_arr.length == 0){
        /*  */

        if(data.password){
            bcrypt.hash(data.password, 10, async function(err,hash){
                if(hash){
                    data.password = hash;
                    var reg = await Admin.create(data);
                    res.status(200).send({data:reg});
                }else{
                    res.status(200).send({message:'ErrorServer',data:undefined});
                }
            })
        }else{
            res.status(200).send({message:'No hay una contraseña',data:undefined});
        }

        
    }else{
        res.status(200).send({message:'El correo ya existe en la base de datos',data:undefined});
    }
}

const login_admin = async function(req,res){
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({email:data.email});

    if(admin_arr.length == 0){
        res.status(200).send({message: 'No se encontro el correo', data: undefined});
    }else{
        //LOGIN
        let user = admin_arr[0];

        bcrypt.compare(data.password, user.password, async function(error,check){
            if(check){
                res.status(200).send({
                    data:user,
                    token: jwt.createToken(user)
                });
            }else{
                res.status(200).send({message: 'La contraseña no coincide', data: undefined}); 
            }
        });
 
    } 
}


const obtener_mensajes_admin  = async function(req,res){
    if(req.user){
        if(['admin', 'asesora', 'soporte'].includes(req.user.role)){

            let reg = await Contacto.find().sort({createdAt:-1});
            res.status(200).send({data:reg});

        }else{
            res.status(500).send({message: 'NoAccess'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const cerrar_mensaje_admin  = async function(req,res){
    if(req.user){
        if(['admin', 'asesora', 'soporte'].includes(req.user.role)){

            let id = req.params['id'];

            let reg = await Contacto.findByIdAndUpdate({_id:id},{estado: 'Cerrado'});
            res.status(200).send({data:reg});

        }else{
            res.status(500).send({message: 'NoAccess'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

//VENTAS

const obtener_ventas_admin  = async function(req,res){
    if(req.user){
        if(['admin', 'asesora', 'direccion', 'compras', 'logistica', 'finanzas', 'soporte'].includes(req.user.role)){
            let ventas = [];
            let desde = req.params['desde'];
            let hasta = req.params['hasta'];

            if(desde == 'undefined' && hasta == 'undefined'){
                let raw_ventas = await Venta.find().populate('cliente').populate('direccion').sort({createdAt:-1});
                for(let v of raw_ventas) {
                    let count_pendientes = 0;
                    if (v.estado !== 'Cancelado') {
                        count_pendientes = await Dventa.countDocuments({ venta: v._id, estado: { $nin: ['Listo', 'Entregado'] } });
                    }
                    let v_obj = v.toObject();
                    v_obj.detalles_pendientes = count_pendientes;
                    ventas.push(v_obj);
                }
                res.status(200).send({data:ventas});
            }else{
                let tt_desde = Date.parse(new Date(desde+'T00:00:00'))/1000;
                let tt_hasta = Date.parse(new Date(hasta+'T00:00:00'))/1000;

                let tem_ventas = await Venta.find().populate('cliente').populate('direccion').sort({createdAt:-1});

                for(var item of tem_ventas){
                    var tt_created = Date.parse(new Date(item.createdAt))/1000;
                    if(tt_created >= tt_desde && tt_created <= tt_hasta){
                        let count_pendientes = 0;
                        if (item.estado !== 'Cancelado') {
                            count_pendientes = await Dventa.countDocuments({ venta: item._id, estado: { $nin: ['Listo', 'Entregado'] } });
                        }
                        let v_obj = item.toObject();
                        v_obj.detalles_pendientes = count_pendientes;
                        ventas.push(v_obj);
                    }
                }

                res.status(200).send({data:ventas});
            }
            
        }else{
            res.status(500).send({message: 'NoAccess'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

//KPI

const kpi_ganancias_mensuales_admin  = async function(req,res){
    if(req.user){
        if(['admin', 'direccion', 'finanzas'].includes(req.user.role)){
           var enero = 0;
           var febrero = 0;
           var marzo = 0;
           var abril = 0;
           var mayo = 0;
           var junio = 0;
           var julio = 0;
           var agosto = 0;
           var septiembre = 0;
           var octubre = 0;
           var noviembre = 0;
           var diciembre = 0;

           var total_ganancia = 0;
           var total_mes = 0;
           var count_ventas = 0;
           var total_mes_anterior = 0;

           var reg = await Venta.find();
           let current_date = new Date();
           let current_year = current_date.getFullYear();
           let current_month = current_date.getMonth()+1;

           for(var item of reg){
               let createdAt_date = new Date(item.createdAt);
               let mes = createdAt_date.getMonth()+1;

               if(createdAt_date.getFullYear() == current_year){

                    total_ganancia = total_ganancia + item.subtotal;

                    if(mes == current_month){
                        total_mes = total_mes + item.subtotal;
                        count_ventas = count_ventas + 1;
                    }

                    if(mes == current_month -1 ){
                        total_mes_anterior = total_mes_anterior + item.subtotal;
                    }

                   if(mes == 1){
                    enero = enero + item.subtotal;
                   }else if(mes == 2){
                    febrero = febrero + item.subtotal;
                   }else if(mes == 3){
                    marzo = marzo + item.subtotal;
                   }else if(mes == 4){
                    abril = abril + item.subtotal;
                   }else if(mes == 5){
                    mayo = mayo + item.subtotal;
                   }else if(mes == 6){
                    junio = junio + item.subtotal;
                   }else if(mes == 7){
                    julio = julio + item.subtotal;
                   }else if(mes == 8){
                    agosto = agosto + item.subtotal;
                   }else if(mes == 9){
                    septiembre = septiembre + item.subtotal;
                   }else if(mes == 10){
                    octubre = octubre + item.subtotal;
                   }else if(mes == 11){
                    noviembre = noviembre + item.subtotal;
                   }else if(mes == 12){
                    diciembre = diciembre + item.subtotal;
                   }
               }
               
           }

          res.status(200).send({
              enero:enero,
              febrero:febrero,
              marzo:marzo,
              abril:abril,
              mayo:mayo,
              junio:junio,
              julio:julio,
              agosto:agosto,
              septiembre:septiembre,
              octubre:octubre,
              noviembre:noviembre,
              diciembre:diciembre,
              total_ganancia:total_ganancia,
              total_mes: total_mes,
              count_ventas:count_ventas,
              total_mes_anterior: total_mes_anterior
          })
            
        }else{
            res.status(500).send({message: 'NoAccess'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const registrar_usuario_interno = async function(req,res){
    if(req.user && req.user.role == 'admin'){
        var data = req.body;
        var admin_arr = await Admin.find({email:data.email});

        if(admin_arr.length == 0){
            if(data.password){
                bcrypt.hash(data.password, 10, async function(err,hash){
                    if(hash){
                        data.password = hash;
                        data.estado = 'Activo';
                        var reg = await Admin.create(data);
                        res.status(200).send({data:reg});
                    }else{
                        res.status(200).send({message:'ErrorServer',data:undefined});
                    }
                })
            }else{
                res.status(200).send({message:'No hay una contraseña',data:undefined});
            }
        }else{
            res.status(200).send({message:'El correo ya existe en la base de datos',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const listar_usuarios_internos = async function(req,res){
    if(req.user && ['admin', 'direccion'].includes(req.user.role)){
        var filtro = req.params['filtro'];
        let query = {};
        if(filtro && filtro != 'undefined' && filtro != 'null'){
            query = {
                $or: [
                    {nombres: new RegExp(filtro, 'i')},
                    {apellidos: new RegExp(filtro, 'i')},
                    {email: new RegExp(filtro, 'i')},
                    {dni: new RegExp(filtro, 'i')}
                ]
            };
        }
        let reg = await Admin.find(query).sort({createdAt:-1});
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_usuario_interno = async function(req,res){
    if(req.user && req.user.role == 'admin'){
        var id = req.params['id'];
        try {
            let reg = await Admin.findById({_id:id});
            res.status(200).send({data:reg});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const actualizar_usuario_interno = async function(req,res){
    if(req.user && req.user.role == 'admin'){
        var id = req.params['id'];
        var data = req.body;
        
        let updateData = {
            nombres: data.nombres,
            apellidos: data.apellidos,
            email: data.email,
            telefono: data.telefono,
            rol: data.rol,
            dni: data.dni,
            estado: data.estado
        };

        if(data.password && data.password.trim() !== ''){
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        let reg = await Admin.findByIdAndUpdate({_id:id}, updateData, {new: true});
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const eliminar_usuario_interno = async function(req,res){
    if(req.user && req.user.role == 'admin'){
        var id = req.params['id'];
        let reg = await Admin.findByIdAndUpdate({_id:id},{estado: 'Desactivado'}, {new: true});
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const enviar_recuperacion_admin = async function(req,res){
    var data = req.body;
    var admin = await Admin.findOne({email:data.email});

    if(!admin){
        return res.status(200).send({message: 'No se encontró el correo', data: undefined});
    }

    var secret = process.env.JWT_SECRET;
    var resetToken = jsonwebtoken.sign({
        sub: admin._id,
        email: admin.email,
        type: 'reset_admin'
    }, secret, { expiresIn: '1h' });

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    var resetLink = (process.env.ADMIN_URL || 'http://localhost:4200') + '/restablecer-contrasena/' + resetToken;

    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: 'Recuperación de Contraseña - LATAM MODA Admin',
        html: `<p>Hola ${admin.nombres},</p>
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

const restablecer_contrasena_admin = async function(req,res){
    var data = req.body;
    var token = data.token;
    var password = data.password;

    try {
        var secret = process.env.JWT_SECRET;
        var payload = jsonwebtoken.verify(token, secret);
        if(payload.type !== 'reset_admin'){
            return res.status(200).send({message: 'Token no válido', data: false});
        }

        bcrypt.hash(password, 10, async function(err,hash){
            if(hash){
                await Admin.findByIdAndUpdate({_id: payload.sub}, {password: hash});
                res.status(200).send({data: true});
            }else{
                res.status(200).send({message:'ErrorServer',data:false});
            }
        });
    } catch (error) {
        res.status(200).send({message: 'Token expirado o no válido', data: false});
    }
}

const obtener_ticket_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'asesora', 'direccion', 'soporte'].includes(req.user.role)) {
            try {
                let id = req.params['id'];
                let reg = await Contacto.findById(id).populate({
                    path: 'venta',
                    populate: { path: 'cliente' }
                });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: 'Error al obtener ticket.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const responder_ticket_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'asesora', 'direccion', 'soporte'].includes(req.user.role)) {
            try {
                let id = req.params['id'];
                let data = req.body;
                
                let ticket = await Contacto.findById(id);
                if (!ticket) {
                    return res.status(404).send({ message: 'Ticket no encontrado.' });
                }
                
                ticket.mensajes.push({
                    emisor: req.user.email || 'asesor',
                    mensaje: data.mensaje,
                    fecha: new Date()
                });
                
                if (data.estado) {
                    ticket.estado = data.estado;
                } else {
                    ticket.estado = 'En proceso';
                }
                
                await ticket.save();
                res.status(200).send({ data: ticket });
            } catch (error) {
                res.status(500).send({ message: 'Error al responder ticket.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    registro_admin,
    login_admin,
    obtener_mensajes_admin,
    cerrar_mensaje_admin,
    obtener_ventas_admin,
    kpi_ganancias_mensuales_admin,
    registrar_usuario_interno,
    listar_usuarios_internos,
    obtener_usuario_interno,
    actualizar_usuario_interno,
    eliminar_usuario_interno,
    enviar_recuperacion_admin,
    restablecer_contrasena_admin,
    obtener_ticket_admin,
    responder_ticket_admin
}
