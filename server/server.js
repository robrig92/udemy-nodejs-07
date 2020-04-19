const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('./config/config');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('./routes/index'));

mongoose.connect(process.env.URL_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) throw err;
    console.log('Database online');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening to port ${process.env.PORT}`);
});