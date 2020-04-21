const express = require('express');
const { checkToken } = require('../middlewares/autenticacion');

const app = express();
let Producto = require('../models/producto');

app.get('/producto', checkToken, (req, res) => {
    let desde = req.query.desde;
    let limite = req.query.limite;
    let condicion = { disponible: true };

    desde = Number(desde);
    limite = Number(limite);

    Producto.find(condicion)
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        res
                    });
            }

            Producto.count(condicion, (err, count) => {
                if (err) {
                    return res.status(500)
                        .json({
                            ok: false,
                            res
                        });
                }

                res.json({
                    ok: true,
                    productos,
                    conteo: count
                });
            });
        });

});

app.post('/producto', checkToken, (req, res) => {
    let body = req.body;
    let usuario = req.usuario;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: usuario._id
    });

    producto.save((err, storedProducto) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        res.json({
            ok: true,
            producto: storedProducto
        });
    });
});

app.get('/producto/buscar/:termino', checkToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.json({
                ok: true,
                productos
            })
        });
})

app.get('/producto/:id', checkToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            if (!producto) {
                return res.status(400)
                    .json({
                        ok: false,
                        message: 'Producto no encontrado'
                    });
            }

            res.json({
                ok: true,
                producto
            });
        });
});

app.put('/producto/:id', checkToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let producto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    };

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, updatedProducto) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!updatedProducto) {
            return res.status(400)
                .json({
                    ok: false,
                    message: 'Producto no encontrado'
                });
        }

        res.json({
            ok: true,
            updatedProducto,
            message: 'Producto actualizado'
        });
    });
});

app.delete('/producto/:id', checkToken, (req, res) => {
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, {
        new: true,
        runValidators: true
    }, (err, producto) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!producto) {
            return res.status(400)
                .json({
                    ok: false,
                    message: 'Producto no encontrado'
                });
        }

        res.json({
            ok: true,
            producto,
            message: 'Producto eliminado'
        });
    });
});

module.exports = app;