'use strict'

var Producto = require('../models/producto');
var Inventario = require('../models/inventario');
var Review = require('../models/review');
var fs = require('fs');
var path = require('path');
var cloudinaryHelper = require('../helpers/cloudinary');

const registro_producto_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            let data = req.body;
            var portada_name = '';

            if (req.files && req.files.portada) {
                if (process.env.CLOUDINARY_CLOUD_NAME) {
                    portada_name = await cloudinaryHelper.uploadImage(req.files.portada.path, 'productos');
                } else {
                    var img_path = req.files.portada.path;
                    var name = img_path.split(path.sep);
                    portada_name = name[name.length - 1];
                }
            }

            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            data.portada = portada_name;
            data.en_tendencia = (data.en_tendencia == 'true' || data.en_tendencia == true);
            if (!data.estado_disponibilidad) data.estado_disponibilidad = 'Disponible';
            if (!data.estado) data.estado = 'Edicion';

            let reg = await Producto.create(data);

            let inventario = await Inventario.create({
                admin: req.user.sub,
                cantidad: data.stock,
                proveedor: 'Primer registro',
                producto: reg._id
            });

            res.status(200).send({ data: reg, inventario: inventario });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_productos_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            var filtro = req.params['filtro'];
            let query = {};
            if (filtro && filtro != 'null') {
                query.titulo = new RegExp(filtro, 'i');
            }
            let reg = await Producto.find(query).sort({ createdAt: -1 });
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_portada = async function (req, res) {
    var img = req.params['img'];

    if (!img || img == 'null' || img == 'undefined') {
        return res.redirect('https://images.placeholders.dev/?width=600&height=600&text=No+Image');
    }

    if (img.startsWith('http://') || img.startsWith('https://')) {
        return res.redirect(img);
    }

    let path_img = path.resolve('./uploads/productos/' + img);
    if (fs.existsSync(path_img)) {
        return res.status(200).sendFile(path_img);
    } else {
        let default_img = path.resolve('./uploads/default.jpg');
        if (fs.existsSync(default_img)) {
            return res.status(200).sendFile(default_img);
        } else {
            return res.redirect('https://images.placeholders.dev/?width=600&height=600&text=No+Image');
        }
    }
}

const obtener_producto_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {

            var id = req.params['id'];

            try {
                var reg = await Producto.findById({ _id: id });

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

const actualizar_producto_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            let id = req.params['id'];
            let data = req.body;
            let en_tendencia = (data.en_tendencia == 'true' || data.en_tendencia == true);

            try {
                if (req.files && req.files.portada) {
                    //SI HAY IMAGEN
                    var portada_name = '';
                    if (process.env.CLOUDINARY_CLOUD_NAME) {
                        try {
                            portada_name = await cloudinaryHelper.uploadImage(req.files.portada.path, 'productos');
                        } catch (err) {
                            console.error('Cloudinary upload error:', err);
                            var img_path = req.files.portada.path;
                            var name = img_path.split(path.sep);
                            portada_name = name[name.length - 1];
                        }
                    } else {
                        var img_path = req.files.portada.path;
                        var name = img_path.split(path.sep);
                        portada_name = name[name.length - 1];
                    }

                    let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                        titulo: data.titulo,
                        stock: data.stock,
                        precio: data.precio,
                        precio_cop: data.precio_cop,
                        categoria: data.categoria,
                        descripcion: data.descripcion,
                        contenido: data.contenido,
                        estado: data.estado || 'Edicion',
                        estado_disponibilidad: data.estado_disponibilidad || 'Disponible',
                        en_tendencia: en_tendencia,
                        fecha_programada: data.fecha_programada || null,
                        peso: parseFloat(data.peso) || 0,
                        portada: portada_name
                    });

                    if (reg && reg.portada && !reg.portada.startsWith('http')) {
                        let old_path = './uploads/productos/' + reg.portada;
                        if (fs.existsSync(old_path)) {
                            fs.unlink(old_path, () => {});
                        }
                    }

                    return res.status(200).send({ data: reg });
                } else {
                    //NO HAY IMAGEN
                    let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                        titulo: data.titulo,
                        stock: data.stock,
                        precio: data.precio,
                        precio_cop: data.precio_cop,
                        categoria: data.categoria,
                        descripcion: data.descripcion,
                        contenido: data.contenido,
                        estado: data.estado || 'Edicion',
                        estado_disponibilidad: data.estado_disponibilidad || 'Disponible',
                        en_tendencia: en_tendencia,
                        fecha_programada: data.fecha_programada || null,
                        peso: parseFloat(data.peso) || 0
                    });

                    return res.status(200).send({ data: reg });
                }
            } catch (error) {
                console.error('Error al actualizar producto:', error);
                return res.status(500).send({ message: 'Error en el servidor', error: error.message });
            }
        } else {
            return res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        return res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_producto_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {

            var id = req.params['id'];

            let reg = await Producto.findByIdAndDelete(id);
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {

            var id = req.params['id'];

            var reg = await Inventario.find({ producto: id }).populate('admin').sort({ createdAt: -1 });
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            //OBTENER ID DEL INVENTARIO
            var id = req.params['id'];

            //ELIMINAR INVENTARIO
            let reg = await Inventario.findByIdAndDelete(id);

            //OBTENER EL REGISTRO DE PRODUCTO
            let prod = await Producto.findById({ _id: reg.producto });

            //CALCULAR EL NUEVO STOCK
            let nuevo_stock = parseInt(prod.stock) - parseInt(reg.cantidad);

            //ACTUALICACION DEL NUEVO STOCK AL PRODUCTO
            let producto = await Producto.findByIdAndUpdate({ _id: reg.producto }, {
                stock: nuevo_stock
            })

            res.status(200).send({ data: producto });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registro_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {

            let data = req.body;

            let reg = await Inventario.create(data);

            //OBTENER EL REGISTRO DE PRODUCTO
            let prod = await Producto.findById({ _id: reg.producto });

            //CALCULAR EL NUEVO STOCK
            //STOCK ACTUAL         //STOCK A AUMENTAR
            let nuevo_stock = parseInt(prod.stock) + parseInt(reg.cantidad);

            //ACTUALICACION DEL NUEVO STOCK AL PRODUCTO
            let producto = await Producto.findByIdAndUpdate({ _id: reg.producto }, {
                stock: nuevo_stock
            })

            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_producto_variedades_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            let id = req.params['id'];
            let data = req.body;

            let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                titulo_variedad: data.titulo_variedad,
                variedades: data.variedades
            });
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const agregar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            let id = req.params['id'];
            let data = req.body;

            var imagen_name = '';
            if (req.files && req.files.imagen) {
                if (process.env.CLOUDINARY_CLOUD_NAME) {
                    imagen_name = await cloudinaryHelper.uploadImage(req.files.imagen.path, 'productos');
                } else {
                    var img_path = req.files.imagen.path;
                    var name = img_path.split(path.sep);
                    imagen_name = name[name.length - 1];
                }
            }

            let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                $push: {
                    galeria: {
                        imagen: imagen_name,
                        _id: data._id
                    }
                }
            });

            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        if (['admin', 'direccion', 'compras'].includes(req.user.role)) {
            let id = req.params['id'];
            let data = req.body;


            let reg = await Producto.findByIdAndUpdate({ _id: id }, { $pull: { galeria: { _id: data._id } } });
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}



//---METODOS PUBLICOS----------------------------------------------------

const listar_productos_publico = async function (req, res) {
    var filtro = req.params['filtro'];
    let query = {};
    if (filtro && filtro != 'null') {
        query.titulo = new RegExp(filtro, 'i');
    }

    let reg = await Producto.find(query).sort({ createdAt: -1 });
    res.status(200).send({ data: reg });
}

const listar_productos_tendencia_publico = async function (req, res) {
    let query = { en_tendencia: true };
    let reg = await Producto.find(query).sort({ createdAt: -1 }).limit(10);
    res.status(200).send({ data: reg });
}

const obtener_productos_slug_publico = async function (req, res) {
    var slug = req.params['slug'];

    let reg = await Producto.findOne({ slug: slug });
    res.status(200).send({ data: reg });
}

const listar_productos_recomendados_publico = async function (req, res) {
    var categoria = req.params['categoria'];

    let reg = await Producto.find({ categoria: categoria }).sort({ createdAt: -1 }).limit(8);
    res.status(200).send({ data: reg });
}

const listar_productos_nuevos_publico = async function (req, res) {
    let reg = await Producto.find().sort({ createdAt: -1 }).limit(8);
    res.status(200).send({ data: reg });
}

const listar_productos_masvendidos_publico = async function (req, res) {
    let reg = await Producto.find().sort({ nventas: -1 }).limit(8);
    res.status(200).send({ data: reg });
}

const obtener_reviews_producto_publico = async function (req, res) {
    let id = req.params['id'];

    let reviews = await Review.find({ producto: id }).populate('cliente').sort({ createdAt: -1 });
    res.status(200).send({ data: reviews });
}

module.exports = {
    registro_producto_admin,
    listar_productos_admin,
    obtener_portada,
    obtener_producto_admin,
    actualizar_producto_admin,
    eliminar_producto_admin,
    listar_inventario_producto_admin,
    eliminar_inventario_producto_admin,
    registro_inventario_producto_admin,
    listar_productos_publico,
    listar_productos_tendencia_publico,
    actualizar_producto_variedades_admin,
    agregar_imagen_galeria_admin,
    eliminar_imagen_galeria_admin,
    obtener_productos_slug_publico,
    listar_productos_recomendados_publico,
    listar_productos_nuevos_publico,
    listar_productos_masvendidos_publico,
    obtener_reviews_producto_publico
}
