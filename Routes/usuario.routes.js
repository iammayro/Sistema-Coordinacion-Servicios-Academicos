const express = require('express');
const authController = require('../Controllers/auth.controller');
const usuarioController = require('../Controllers/usuario.controller');

const router = express.Router();

router.use(authController.validarCredenciales);
router
  .route('')
  .post(
    // se mandan los tipos de usuario como parametro que pueden acceder a esta ruta
    authController.limitarAcceso('coordinador de personal'),
    authController.crearUsuario
  )
  .get(
    // se mandan los tipos de usuario como parametro que pueden acceder a esta ruta
    authController.limitarAcceso(
      'coordinador de personal',
      'jefe de departamento'
    ),
    usuarioController.getUsuarios
  );

router
  .route('/:codigo')
  .get(usuarioController.mostrarUsuario)
  .put(usuarioController.validarAlcance, usuarioController.modificarUsuario)
  .delete(
    authController.limitarAcceso('coordinador de personal'),
    usuarioController.borrarUsuario
  );

router
  .route('/:codigo/subir/perfil')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirFotoPerfil,
    usuarioController.redimencionarFoto,
    usuarioController.eliminarArchivoPrevio('foto_perfil', 'imagen'),
    usuarioController.modificarUsuario
  );

router
  .route('/:codigo/subir/curp')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirArchivo('curp_digitalizado'),
    usuarioController.guardarArchivo,
    usuarioController.eliminarArchivoPrevio('curp_digitalizado', 'doc'),
    usuarioController.modificarUsuario
  );

router
  .route('/:codigo/subir/imss')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirArchivo('imss_digitalizado'),
    usuarioController.guardarArchivo,
    usuarioController.eliminarArchivoPrevio('imss_digitalizado', 'doc'),
    usuarioController.modificarUsuario
  );

router
  .route('/:codigo/subir/rfc')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirArchivo('rfc_digitalizado'),
    usuarioController.guardarArchivo,
    usuarioController.eliminarArchivoPrevio('rfc_digitalizado', 'doc'),
    usuarioController.modificarUsuario
  );

router
  .route('/:codigo/subir/ficha-unica')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirArchivo('ficha_unica_digitalizado'),
    usuarioController.guardarArchivo,
    usuarioController.eliminarArchivoPrevio('ficha_unica_digitalizado', 'doc'),
    usuarioController.modificarUsuario
  );

router
  .route('/:codigo/subir/acta-nacimiento')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirArchivo('acta_nacimiento_digitalizado'),
    usuarioController.guardarArchivo,
    usuarioController.eliminarArchivoPrevio(
      'acta_nacimiento_digitalizado',
      'doc'
    ),
    usuarioController.modificarUsuario
  );

router
  .route('/:codigo/subir/identificacion')
  .post(
    usuarioController.validarAlcance,
    usuarioController.subirArchivo('identificacion_digitalizado'),
    usuarioController.guardarArchivo,
    usuarioController.eliminarArchivoPrevio(
      'identificacion_digitalizado',
      'doc'
    ),
    usuarioController.modificarUsuario
  );
  
module.exports = router;
