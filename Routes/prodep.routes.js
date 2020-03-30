const express = require('express');
const app = express();

const prodepCtrl = require('../Controllers/prodep.controller');
const prodep_expedienteCtrl = require ('../Controllers/prodep_expediente.controller');
const prodep_dictamenCtrl = require ('../Controllers/prodep_dictamen.controller');
const archivos = require('../middlewares/multer');

app.post('/:codigo', prodepCtrl.crearProdep);
app.put('/:codigo/actualizar', prodepCtrl.actualizarProdep);
app.get('/:codigo', prodepCtrl.verProdep);

app.post('/:codigo/expediente',archivos.single('expediente'), prodep_expedienteCtrl.subirExpediente);
app.put('/:codigo/expediente/actualizar',archivos.single('expediente'), prodep_expedienteCtrl.actualizarExpediente);
app.get('/:codigo/expediente/descargar', prodep_expedienteCtrl.descargarExpediente);
app.get('/:codigo/expediente', prodep_expedienteCtrl.verExpediente);

app.post('/:codigo/dictamen',archivos.single('dictamen'), prodep_dictamenCtrl.subirDictamen);
app.put('/:codigo/dictamen/actualizar',archivos.single('dictamen'), prodep_dictamenCtrl.actualizarDictamen);
app.get('/:codigo/dictamen/descargar', prodep_dictamenCtrl.descargarDictamen);
app.get('/:codigo/dictamen', prodep_dictamenCtrl.verDictamen);

module.exports = app;
