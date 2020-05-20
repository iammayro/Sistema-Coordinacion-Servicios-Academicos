const express = require('express');

const app = express();

const prodepCtrl = require('../Controllers/prodep.controller');
const prodepExpedienteCtrl = require('../Controllers/prodep_expediente.controller');
const prodepDictamenCtrl = require('../Controllers/prodep_dictamen.controller');
const authCtrl = require('../Controllers/auth.controller');
const archivos = require('../Middlewares/multer').uploadFile;
app.use(authCtrl.validarCredenciales);

app.post(
  '/:codigo',
  authCtrl.limitarAcceso('coordinador de personal'),
  prodepCtrl.crearProdep
);
app.put(
  '/:codigo/actualizar',
  authCtrl.limitarAcceso('coordinador de personal'),
  prodepCtrl.actualizarProdep
);
app.get(
  '/:codigo',
  prodepCtrl.verProdep
);

app.post(
  '/:codigo/expediente',
  authCtrl.limitarAcceso('coordinador de personal'),
  archivos.single('expediente'),
  prodepExpedienteCtrl.subirExpediente
);
app.put(
  '/:codigo/expediente/actualizar',
  authCtrl.limitarAcceso('coordinador de personal'),
  archivos.single('expediente'),
  prodepExpedienteCtrl.actualizarExpediente
);
app.get(
  '/:codigo/expediente/descargar',
  authCtrl.limitarAcceso('coordinador de personal', 'maestro'),
  prodepExpedienteCtrl.descargarExpediente
);
app.get(
  '/:codigo/expediente',
  prodepExpedienteCtrl.verExpediente
);

app.post(
  '/:codigo/dictamen',
  authCtrl.limitarAcceso('coordinador de personal'),
  archivos.single('dictamen'),
  prodepDictamenCtrl.subirDictamen
);
app.put(
  '/:codigo/dictamen/actualizar',
  authCtrl.limitarAcceso('coordinador de personal'),
  archivos.single('dictamen'),
  prodepDictamenCtrl.actualizarDictamen
);
app.get(
  '/:codigo/dictamen/descargar',
  authCtrl.limitarAcceso('coordinador de personal', 'maestro'),
  prodepDictamenCtrl.descargarDictamen
);
app.get(
  '/:codigo/dictamen',
  prodepDictamenCtrl.verDictamen
);

module.exports = app;
