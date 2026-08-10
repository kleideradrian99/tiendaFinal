'use strict'

var jwt = require('jsonwebtoken');
var secret = process.env.JWT_SECRET;

exports.auth = function(req,res,next){

    if(!req.headers.authorization){
        return res.status(403).send({message: 'NoHeadersError'});
    }

    var token = req.headers.authorization.replace(/['"]+/g,'');

    var segment = token.split('.');

    if(segment.length != 3){
        return res.status(403).send({message: 'InvalidToken'});
    }else{
        try {
            var payload = jwt.verify(token, secret);
        } catch (error) {
            if(error.name == 'TokenExpiredError'){
                return res.status(403).send({message: 'TokenExpirado'});
            }
            return res.status(403).send({message: 'InvalidToken'});
        }
    }

    req.user = payload;

    next();

}

exports.checkRole = function(roles) {
    return function(req, res, next) {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).send({ message: 'NoAccess' });
        }
    }
}
