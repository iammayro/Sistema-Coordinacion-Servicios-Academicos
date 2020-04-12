const express = require('express');
const authController = require('../Controllers/auth.controller');
const usuarioController = require('../Controllers/usuario.controller');

const router = express.Router();

router
  .route('')
  .post(
    authController.validarCredenciales,
    authController.limitarAcceso('coordinador de personal'),
    authController.crearUsuario
  )
  .get(
    authController.validarCredenciales,
    authController.limitarAcceso(
      'coordinador de personal',
      'jefe de departamento'
    ),
    usuarioController.getUsuarios
  );

module.exports = router;
