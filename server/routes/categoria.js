const express = require('express');
let { checkToken, checkAdmin } = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria');

const app = express();

app.get('/categoria', checkToken, (req, res) => {
    Categoria.find({}, (err, categorias) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categorias
        })
    });
});

app.post('/categoria', checkToken, (req, res) => {
    let body = req.body;
    let usuario = req.usuario;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario_id: usuario._id
    });

    categoria.save(categoria, (err, storedCategoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            categoria: storedCategoria
        });
    })
});

app.get('/categoria/:id', checkToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                message: 'Categoría no encontrada'
            });
        }

        res.json({
            ok: true,
            categoria
        })
    })
});

app.put('/categoria/:id', checkToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;
    let args = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, args, { new: true, useFindAndModify: true, runValidators: true, context: 'query' }, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                message: 'No encontrado'
            })
        }

        res.json({
            ok: true,
            categoria
        });
    });
});

app.delete('/categoria/:id', [checkToken, checkAdmin], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                message: 'No encontrado'
            });
        }

        res.json({
            ok: true,
            categoria
        })
    });
});

module.exports = app;