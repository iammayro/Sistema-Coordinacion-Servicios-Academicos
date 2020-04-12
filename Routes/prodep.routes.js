const express = require('express');

const app = express();

const prodepCtrl = require('../Controllers/prodep.controller');
const prodepExpedienteCtrl = require('../Controllers/prodep_expediente.controller');
const prodepDictamenCtrl = require('../Controllers/prodep_dictamen.controller');
const archivos = require('../Middlewares/multer');

app.post('/:codigo', prodepCtrl.crearProdep);
app.put('/:codigo/actualizar', prodepCtrl.actualizarProdep);
app.get('/:codigo', prodepCtrl.verProdep);

app.post(
  '/:codigo/expediente',
  archivos.single('expediente'),
  prodepExpedienteCtrl.subirExpediente
);
app.put(
  '/:codigo/expediente/actualizar',
  archivos.single('expediente'),
  prodepExpedienteCtrl.actualizarExpediente
);
app.get(
  '/:codigo/expediente/descargar',
  prodepExpedienteCtrl.descargarExpediente
);
app.get('/:codigo/expediente', prodepExpedienteCtrl.verExpediente);

app.post(
  '/:codigo/dictamen',
  archivos.single('dictamen'),
  prodepDictamenCtrl.subirDictamen
);
app.put(
  '/:codigo/dictamen/actualizar',
  archivos.single('dictamen'),
  prodepDictamenCtrl.actualizarDictamen
);
app.get('/:codigo/dictamen/descargar', prodepDictamenCtrl.descargarDictamen);
app.get('/:codigo/dictamen', prodepDictamenCtrl.verDictamen);

module.exports = app;
