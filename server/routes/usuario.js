const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();

app.get('/usuario', (req, res) => {
    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;

    desde = Number(desde);
    limite = Number(limite);

    let condicion = { estado: true };

    Usuario.find(condicion, 'nombre email google img estado role')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count(condicion, (err, count) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    usuarios,
                    conteo: count
                });
            });
        });
});

app.post('/usuario', (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
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

    let usuario = _.pick(body, [
        'nombre',
        'email',
        'img',
        'role',
        'estado'
    ]);

    Usuario.findByIdAndUpdate(id, usuario, { new: true, runValidators: true, useFindAndModify: false, context: 'query' }, (err, updatedUsuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'No encontrado'
            });
        }

        res.json({
            ok: true,
            usuario: updatedUsuario
        })
    });
});

app.delete('/usuario/:id', (req, res) => {
    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'No encontrado'
            });
        }

        res.json({
            ok: true,
            usuario
        })
    });
});

module.exports = app;