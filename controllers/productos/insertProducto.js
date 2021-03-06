'use strict'

const conn = require('../connect').connection;
var Request = require("request");
let jsonProductos;

async function insertProduct(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const options = {
        url: 'http://35.231.130.137:8081/PIM/obtenerCatalogo',
        //url: 'http://america.esb5.softwareavanzado.world:8081/PIM/obtenerCatalogo',
        method: 'GET',
        json: true,
        headers: {
            'scope': 'obtenerCatalogo',
            'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6MSwicm9sZXMiOiJvYnRlbmVyQ2F0YWxvZ28sZW5yaXF1ZWNlclByb2R1Y3RvLG9idGVuZXJJbnZlbnRhcmlvLHJlYWxpemFyRGVzcGFjaG8iLCJpYXQiOjE1NTc1OTM3OTUsImV4cCI6MTU1NzU5NzM5NX0.7tcMYegcxTJs2MlH5l34GxSvcuMmMdRcd14G4hzSeac'
        }
    };

    Request(options, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        jsonProductos = body;

        try {
            //console.log(jsonProductos);
            var categorias = jsonProductos["categorias"];
            var productos = jsonProductos["productos"];
            //console.log(productos);

            //INSERTAR CATEGORIAS
            for (let i = 0; i < categorias.length; i++) {
                try {
                    conn.query('insert ignore into Categoria(idCategoria, nombre, idPadre)'
                        + 'values (' + categorias[i].id + ',"' + categorias[i].nombre + '",' + categorias[i].padre + ');',
                        function (error, results, fields) {
                            if (error) {
                                console.log(error);
                                res.jsonp({ error: 'Error de conexión a la base de datos.' })
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
            }
            console.log("Se han insertado las categorias a la TIENDA correctamente");

            //INSERTAR PRODUCTOS 
            //Se toma solo el 80% de los productos
            var cantidad = productos.length * 0.8;
            var cantidadTienda = productos.length * 0.2;
            console.log("Cantidad de Productos 80% es " + parseInt(cantidad) + " de " + productos.length);

            for (let i = 0; i < parseInt(cantidad); i++) {
                try {
                    conn.query('insert ignore into Producto(nombre, SKU, estado, proveedor)'
                        + 'values ("' + productos[i].nombre + '", "' + productos[i].sku + '",' + productos[i].activo + ', "pim");',
                        function (error, results, fields) {
                            if (error) {
                                console.log(error);
                                res.jsonp({ error: 'Error de conexión a la base de datos.' })
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
            }
            //Se toma el 20% de la cantidad para agregar productos propios de la tienda
            for (let i = 0; i < parseInt(cantidadTienda); i++) {
                try {
                    var num = i + 1;
                    conn.query('insert ignore into Producto(nombre, SKU, precioLista, descripcion, caracteristicas, estado, proveedor)'
                        + 'values ("Producto ' + num + '", "T' + productos[i].sku + '",' + num * 100 + ', "Producto propio de la tienda",'
                        + '"Caracteristicas propias del producto ' + num + '",' + productos[i].activo + ',"tienda");',
                        function (error, results, fields) {
                            if (error) {
                                console.log(error);
                                res.jsonp({ error: 'Error de conexión a la base de datos.' })
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
            }
            console.log("Se han insertado los productos a la TIENDA correctamente");

            //INSERTAR CATEGORIA_PRODUCTO
            for (let i = 0; i < productos.length; i++) {
                for (let j = 0; j < productos[i].categorias.length; j++) {
                    try {
                        conn.query('insert ignore into CategoriaProducto(idProducto, idCategoria)' +
                            'values( (Select idProducto from Producto where sku="' + productos[i].sku + '") ,' + productos[i].categorias[j] + ');',
                            function (error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    res.jsonp({ error: 'Error de conexión a la base de datos.' })
                                }
                            });
                    } catch (error) {
                        console.log(error);
                    }
                }
            }

            //Se agrega las categorias a los productos propios de la tienda
            for (let i = 0; i < parseInt(cantidadTienda); i++) {
                var randomCategoria = Math.random() * (categorias.length - 2) + 1;
                var randomEntero = parseInt(randomCategoria);
                console.log("El random es = " + randomEntero);
                try {
                    conn.query('insert ignore into CategoriaProducto(idProducto, idCategoria)' +
                        'values( (Select idProducto from Producto where sku="' + productos[i].sku + '") ,' + randomEntero + ');',
                        function (error, results, fields) {
                            if (error) {
                                console.log(error);
                                res.jsonp({ error: 'Error de conexión a la base de datos.' })
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
            }
            console.log("Se ha insertado la categoria_producto a la TIENDA correctamente");

        } catch (error) {
            console.log(error);
            console.log("* * * * * * * * * * * * * * * * * * * * *");
            console.log("Error al obtener el servicio desde el PIM");
            console.log("* * * * * * * * * * * * * * * * * * * * *");
            //res.redirect('/insert')
        }
    });
    res.redirect('/');
}


module.exports = {
    insertProduct
}