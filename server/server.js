const express = require('express');
const bodyParser = require('body-parser');
require('./config/config');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/usuario', (req, res) => {
    res.json('Get usuario');
});

app.post('/usuario', (req, res) => {
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
        return;
    }

    res.json({ body });
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

app.listen(process.env.PORT, () => {
    console.log(`Listening to port ${process.env.PORT}`);
});