const express = require('express');
const authController = require('../Controllers/auth.controller');
const app = express();

const controllerCA = require('../Controllers/CA.controller');
const controllerEXP = require('../Controllers/CA.expediente.controller');
const controllerDIC = require('../Controllers/CA.dictamen.controller');
const controllerINT = require('../Controllers/CA.integrante.controller');
const archivos = require('../Middlewares/multer').uploadFile;
app.use(authController.validarCredenciales);
app.post(
	'/ca', 
	authController.limitarAcceso('coordinador de personal'), 
	controllerCA.postCuerpoAcademico
);
app.put(
	'/ca/:id', 
	authController.limitarAcceso('coordinador de personal'), 
	controllerCA.putCuerpoAcademico
);
app.get(
	'/ca', 
	controllerCA.getCuerposAcademicos
);
app.get(
	'/ca/:id', 
	controllerCA.getCuerpoAcademico
);
app.get(
	'/ca/:id/expediente/descargar', 
	authController.limitarAcceso('coordinador de personal','maestro'), 
	controllerEXP.getCuerpoAcademicoExp
);
app.post(
  '/ca/:id/expediente',
  authController.limitarAcceso('coordinador de personal'),
  archivos.single('expediente'),
  controllerEXP.postCuerpoAcademicoExp
);
app.put(
  '/ca/:id/expediente',
  authController.limitarAcceso('coordinador de personal'),
  archivos.single('expediente'),
  controllerEXP.putCuerpoAcademicoExp
);
app.post(
  '/ca/:id/dictamen',
  authController.limitarAcceso('coordinador de personal'),
  archivos.single('dictamen'),
  controllerDIC.postCuerpoAcademicoDic
);
app.put(
  '/ca/:id/dictamen/:id_dictamen',
  authController.limitarAcceso('coordinador de personal'),
  archivos.single('dictamen'),
  controllerDIC.putCuerpoAcademicoDic
);
app.get(
  '/ca/:id/dictamen/:id_dictamen/descargar',
  controllerDIC.getCuerpoAcademicoDic
);
app.post(
	'/ca/:id/integrante',
	authController.limitarAcceso('coordinador de personal'),
	controllerINT.postCuerpoAcademicoIntegrante
);
app.delete(
  '/ca/:id/integrante/:codigo',
  authController.limitarAcceso('coordinador de personal'),
  controllerINT.deleteCuerpoAcademicoIntegrante
);

module.exports = app;
