var Config = require('../models/config');
var fs = require('fs');
var path = require('path');
var cloudinaryHelper = require('../helpers/cloudinary');

const getOrCreateConfig = async function () {
    let reg = await Config.findById("664526b432ea5f7527aeef3a");
    if (!reg) {
        reg = await Config.create({
            _id: "664526b432ea5f7527aeef3a",
            categorias: [],
            titulo: "Mi Tienda",
            logo: "default.jpg",
            serie: "001",
            correlativo: "000001"
        });
    }
    return reg;
}

const obtener_config_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {

            let reg = await getOrCreateConfig();
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualiza_config_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == 'admin') {

            let data = req.body;
            if (req.files && req.files.logo) {
                var logo_name = '';
                if (process.env.CLOUDINARY_CLOUD_NAME) {
                    logo_name = await cloudinaryHelper.uploadImage(req.files.logo.path, 'configuraciones');
                } else {
                    var img_path = req.files.logo.path;
                    var name = img_path.split(path.sep);
                    logo_name = name[name.length - 1];
                }

                let reg = await Config.findByIdAndUpdate({ _id: "664526b432ea5f7527aeef3a" }, {
                    categorias: JSON.parse(data.categorias),
                    titulo: data.titulo,
                    serie: data.serie,
                    logo: logo_name,
                    correlativo: data.correlativo,
                }, { new: true });

                fs.stat('./uploads/configuraciones/' + reg.logo, function (err) {
                    if (!err) {
                        fs.unlink('./uploads/configuraciones/' + reg.logo, (err) => {
                            if (err) throw err;
                        });
                    }
                })
                res.status(200).send({ data: reg });
            } else {
                // console.log('No hay img');
                let reg = await Config.findByIdAndUpdate({ _id: "664526b432ea5f7527aeef3a" }, {
                    categorias: data.categorias,
                    titulo: data.titulo,
                    serie: data.serie,
                    correlativo: data.correlativo,
                }, { new: true });
                res.status(200).send({ data: reg });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_logo = async function (req, res) {
    var img = req.params['img'];

    if (!img || img == 'null' || img == 'undefined') {
        return res.redirect('https://images.placeholders.dev/?width=300&height=100&text=Logo');
    }

    if (img.startsWith('http://') || img.startsWith('https://')) {
        return res.redirect(img);
    }

    let path_img = path.resolve('./uploads/configuraciones/' + img);
    if (fs.existsSync(path_img)) {
        return res.status(200).sendFile(path_img);
    } else {
        let default_img = path.resolve('./uploads/default.jpg');
        if (fs.existsSync(default_img)) {
            return res.status(200).sendFile(default_img);
        } else {
            return res.redirect('https://images.placeholders.dev/?width=300&height=100&text=Logo');
        }
    }
}

const obtener_config_publico = async function (req, res) {
    let reg = await getOrCreateConfig();
    res.status(200).send({ data: reg });
}

module.exports = {
    actualiza_config_admin,
    obtener_config_admin,
    obtener_logo,
    obtener_config_publico
}