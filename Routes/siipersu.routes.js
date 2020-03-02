const express = require('express');
const app = express();

const controller = require('../Controllers/siipersu.controller');

app.get('/test', controller.hola);

module.exports = app;