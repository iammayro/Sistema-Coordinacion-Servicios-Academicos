const express = require('express');
const authController = require('../Controllers/auth.controller');
const usuarioController = require('../Controllers/usuario.controller');

const router = express.Router();

router
  .route('')
  .post(
    authController.validarCredenciales,
    // se mandan los tipos de usuario como parametro que pueden acceder a esta ruta
    authController.limitarAcceso('coordinador de personal'),
    authController.crearUsuario
  )
  .get(
    authController.validarCredenciales,
    // se mandan los tipos de usuario como parametro que pueden acceder a esta ruta
    authController.limitarAcceso(
      'coordinador de personal',
      'jefe de departamento'
    ),
    usuarioController.getUsuarios
  );

router
  .route('/:codigo')
  .get(authController.validarCredenciales, usuarioController.mostrarUsuario)
  .put(authController.validarCredenciales, usuarioController.modificarUsuario)
  .delete(
    authController.validarCredenciales,
    authController.limitarAcceso('coordinador de personal'),
    usuarioController.borrarUsuario
  );

module.exports = router;
