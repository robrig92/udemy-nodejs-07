const fs = require('fs');
const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const {
    checkToken
} = require('../middlewares/autenticacion');

const app = express();

app.use(fileUpload({
    useTempFiles: true
}));

app.put('/upload/:tipo/:id', checkToken, function(req, res) {
    let id = req.params.id;
    let tipo = req.params.tipo;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se envió ningún archivo'
            }
        });
    }

    let tipos = ['productos', 'usuarios'];

    if (tipos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los tipos permitidos son ' + tipos.join(', ')
                }
            });
    }

    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];
    let extensiones = ['png', 'jpg', 'jpeg', 'gif'];

    if (extensiones.indexOf(extension, extensiones) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Formato de archivo inválido'
                }
            });
    }

    let nombreUnicoArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreUnicoArchivo}`, (err) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (tipo === 'usuarios') {
            imagenUsuario(res, id, nombreUnicoArchivo);
        } else {
            imagenProducto(res, id, nombreUnicoArchivo);
        }
    });
});

function imagenUsuario(res, id, nombreArchivo) {
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            borraArchivo('usuarios', nombreArchivo);

            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        if (!usuario) {
            borraArchivo('usuarios', nombreArchivo);

            return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
        }

        borraArchivo('usuarios', usuario.img);

        usuario.img = nombreArchivo;
        usuario.save((err, updatedUsuario) => {
            if (err) {
                borraArchivo('usuarios', nombreArchivo);

                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.json({
                ok: true,
                usuario: updatedUsuario,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(res, id, nombreArchivo) {
    Producto.findById(id, (err, producto) => {
        if (err) {
            borraArchivo('productos', nombreArchivo);

            return res.status(500)
                .json({
                    ok: false,
                    err
                })
        }

        if (!producto) {
            borraArchivo('productos', nombreArchivo);

            return res.status(500)
                .json({
                    ok: false,
                    err: {
                        message: 'No se encontró el producto'
                    }
                })
        }

        borraArchivo('productos', producto.img);

        producto.img = nombreArchivo;

        producto.save((err, updatedProducto) => {
            if (err) {
                borraArchivo('productos', nombreArchivo);

                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }

            res.json({
                ok: true,
                producto,
                img: nombreArchivo
            });
        });
    });
}

function borraArchivo(tipo, nombreArchivo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;