'use strict'

var cloudinary = require('cloudinary').v2;
var fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a local file to Cloudinary and deletes local temporary file.
 * @param {string} filePath - Path to local temp file.
 * @param {string} folder - Destination folder name in Cloudinary.
 * @returns {Promise<string>} Secure URL of uploaded image.
 */
exports.uploadImage = async function (filePath, folder = 'productos') {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'tienda/' + folder
        });
        // Clean up temporary local file if exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return result.secure_url;
    } catch (error) {
        console.error('Error al subir a Cloudinary:', error);
        // Fallback: if upload fails, clean up temp file and throw error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

exports.cloudinary = cloudinary;
