var Pedido = require('../models/pedidos');
var Dpedido = require('../models/pedidos_detalles');
var Producto = require('../models/producto');
var Venta = require('../models/venta');

const registro_pedido_admin = async function (req, res) {
    if (req.user) {
        var data = req.body;
        var detalles = data.detalles;

        // Validacion Nventa
        var venta_last = await Venta.find().sort({ createdAt: -1 });
        var serie;
        var correlativo;
        var n_venta;
        if (venta_last.length == 0) {
            serie = '001';
            correlativo = '000001';
            n_venta = serie + '-' + correlativo;
        } else {
            var last_nventa = venta_last[0].nventa;
            var arr_nventa = last_nventa.split('-');

            if (arr_nventa[1] != '999999') {
                var new_correlativo = zfill(parseInt(arr_nventa[1]) + 1, 6);
                n_venta = arr_nventa[0] + '-' + new_correlativo;
            } else if (arr_nventa[1] == '999999') {
                var new_serie = zfill(parseInt(arr_nventa[0]) + 1, 3);
                n_venta = new_serie + '-000001';
            }
        }//Fin Validacion Nventa
        

    }
}

module.exports = {
    registro_pedido_admin
}