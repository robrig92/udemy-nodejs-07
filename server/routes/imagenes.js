const fs = require('fs');
const path = require('path');
const express = require('express');
const { checkTokenImage } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', checkTokenImage, (req, res) => {
    let img = req.params.img;
    let tipo = req.params.tipo;
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (!fs.existsSync(pathImg)) {
        res.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
    }

    res.sendFile(pathImg);
});

module.exports = app;