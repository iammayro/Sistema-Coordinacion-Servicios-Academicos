const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Cargar las variables de entorno
require('dotenv').config();

// Conectar a mongoose
mongoose.connect('mongodb://localhost:27017/CSA', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log(`[status] Conectado a Mongoose`);
});

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas divididas en modulos
app.use('/', require('./Routes/siipersu.routes'));
app.use('/', require('./Routes/CA.routes'));
app.use('/pro', require('./Routes/prodep.routes'));

// Correr el puerto
app.listen(process.env.PORT, function() {
    console.log(`[status] API Corriendo en el puerto ${process.env.PORT}`);
});
