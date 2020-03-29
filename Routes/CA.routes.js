const express = require('express');
const app = express();

const controllerCA = require('../Controllers/CA.controller');
const controllerEXP = require('../Controllers/CA.expediente.controller');
const controllerDIC = require('../Controllers/CA.dictamen.controller');
const controllerINT = require('../Controllers/CA.integrante.controller');
const archivos = require('../middlewares/multer');

app.post('/ca', controllerCA.postCuerpoAcademico);
app.put('/ca/:id', controllerCA.putCuerpoAcademico);
app.get('/ca', controllerCA.getCuerposAcademicos);
app.get('/ca/:id', controllerCA.getCuerpoAcademico);
app.get('/ca/:id/expediente/descargar', controllerEXP.getCuerpoAcademicoExp);
app.post('/ca/:id/expediente', archivos.single('expediente'), controllerEXP.postCuerpoAcademicoExp);
app.put('/ca/:id/expediente', archivos.single('expediente'), controllerEXP.putCuerpoAcademicoExp);
app.post('/ca/:id/dictamen', archivos.single('dictamen'), controllerDIC.postCuerpoAcademicoDic);
app.put('/ca/:id/dictamen/:id_dictamen', archivos.single('dictamen'), controllerDIC.putCuerpoAcademicoDic);
app.get('/ca/:id/dictamen/:id_dictamen/descargar', controllerDIC.getCuerpoAcademicoDic);
app.post('/ca/:id/integrante', controllerINT.postCuerpoAcademicoIntegrante);
app.delete('/ca/:id/integrante/:codigo', controllerINT.deleteCuerpoAcademicoIntegrante);

module.exports = app;