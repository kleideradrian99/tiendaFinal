'use strict'

var multer = require('multer');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

function normalizeFiles(req, res, next) {
    if (Array.isArray(req.files)) {
        if (req.files.length == 0) {
            req.files = undefined;
            return next();
        }

        req.files = req.files.reduce(function (files, file) {
            files[file.fieldname] = file;
            return files;
        }, {});
    }

    next();
}

exports.createUpload = function (uploadDir) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname));
        }
    });

    return [
        multer({ storage: storage }).any(),
        normalizeFiles
    ];
}
