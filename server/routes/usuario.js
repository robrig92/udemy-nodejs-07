const express = require('express');
const Usuario = require('../models/usuario');
const app = express();

app.get('/usuario', (req, res) => {
    res.json('Get usuario');
});

app.post('/usuario', (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        role: body.role
    });

    usuario.save((err, storedUser) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: storedUser
        });
    });
});

app.put('/usuario/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    res.json({
        id,
        body
    });
});

app.delete('/usuario/:id', (req, res) => {
    let id = req.params.id;
    res.json('Delete usuario');
});

module.exports = app;