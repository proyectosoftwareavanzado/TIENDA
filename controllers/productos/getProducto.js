'use strict'

const conn = require('../connect').connection;
let compras;

async function getProductos(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    await conn.query('SELECT * FROM TIENDA.Producto;', function (error, results, fields) {
        if (error) {
            console.log(error);
            res.jsonp({ error: 'Error de conexión a la base de datos.' })
        }
        for (let i = 0; i < results.length; i++) {
            //console.log(results[i].descripcion);
            if (!results[i].precioLista) {
                results[i].precioLista = "0";
            } else if (!results[i].descripcion) {
                results[i].descripcion = "No disponible";
            } else if (!results[i].caracteristicas) {
                results[i].caracteristicas = "No disponible";
            }
        }   
        conn.query('Select * from Producto where idProducto in (select idProducto from Carrito);', function (error, results, fields) {
            if (error) {
                console.log(error);
                 res.jsonp({ error: 'Error de conexión a la base de datos.' })
            }
            compras = results;
        });
        res.render('index', { products: results, carrito: compras });
    });
}

module.exports = {
    getProductos
}