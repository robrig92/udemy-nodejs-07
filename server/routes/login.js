const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    OAuth2Client
} = require('google-auth-library');
const Usuario = require('../models/usuario');

const app = express();
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario y/o contraseña incorrectos',
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario y/o contraseña incorrectos',
            });
        }

        let token = jwt.sign({
            usuario
        }, process.env.SEED, { expiresIn: process.env.JWT_EXP });

        return res.json({
            ok: true,
            usuario,
            token
        });
    });
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Usuario si existe en database.
        if (usuario) {
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe de usar sus credenciales para iniciar sesión'
                });
            }

            let token = jwt.sign({
                usuario
            }, process.env.SEED, { expiresIn: process.env.JWT_EXP });

            return res.json({
                ok: true,
                usuario,
                token
            });
        }

        // Generar nuevo usuario.
        let newUsuario = new Usuario();

        newUsuario.nombre = googleUser.nombre;
        newUsuario.email = googleUser.email;
        newUsuario.img = googleUser.img;
        newUsuario.google = true;
        newUsuario.password = ':)';

        newUsuario.save((err, createdUser) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            let token = jwt.sign({
                usuario
            }, process.env.SEED, { expiresIn: process.env.JWT_EXP });

            res.json({
                ok: true,
                usuario: createdUser,
                token
            });
        });
    });
});

module.exports = app;