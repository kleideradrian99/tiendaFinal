'use strict'

var jwt = require('jsonwebtoken');
var secret = 'diegoararca';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.rol
    }

    return jwt.sign(payload, secret, { expiresIn: '7d' });
}
