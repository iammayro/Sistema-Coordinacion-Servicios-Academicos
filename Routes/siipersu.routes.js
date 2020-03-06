const express = require('express');
const app = express();

const controller = require('../Controllers/siipersu.controller');

// funcion definida por fernando <3 7u7
app.get('/test', controller.hola);
// ruta de prueba de la ruta de trabajador (obtener usuario)
app.get('/test/trabajador', controller.getTrabajadores)

module.exports = app;