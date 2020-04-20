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
  .get(usuarioController.validarAlcance, usuarioController.mostrarUsuario)
  .put(usuarioController.validarAlcance, usuarioController.modificarUsuario)
  .delete(
    usuarioController.validarAlcance,
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

router
  .route('/:codigo/cv/idioma')
  .get(usuarioController.validarAlcance, usuarioController.getIdiomas)
  .post(usuarioController.validarAlcance, usuarioController.agregarIdioma);

router
  .route('/:codigo/cv/idioma/:id')
  .delete(usuarioController.validarAlcance, usuarioController.borrarIdioma)
  .put(usuarioController.validarAlcance, usuarioController.modificarIdioma);

router
  .route('/:codigo/cv/programa')
  .get(usuarioController.validarAlcance, usuarioController.getProgramas)
  .post(usuarioController.validarAlcance, usuarioController.agregarPrograma);

router
  .route('/:codigo/cv/programa/:id')
  .delete(usuarioController.validarAlcance, usuarioController.borrarPrograma)
  .put(usuarioController.validarAlcance, usuarioController.modificarPrograma);

router
  .route('/:codigo/cv/posicion')
  .get(usuarioController.validarAlcance, usuarioController.getPosiciones)
  .post(usuarioController.validarAlcance, usuarioController.agregarPosicion);

router
  .route('/:codigo/cv/posicion/:id')
  .delete(usuarioController.validarAlcance, usuarioController.borrarPosicion)
  .put(usuarioController.validarAlcance, usuarioController.modificarPosicion);

router
  .route('/:codigo/cv/logro')
  .get(usuarioController.validarAlcance, usuarioController.getLogros)
  .post(usuarioController.validarAlcance, usuarioController.agregarLogro);

router
  .route('/:codigo/cv/logro/:id')
  .delete(usuarioController.validarAlcance, usuarioController.borrarLogro)
  .put(usuarioController.validarAlcance, usuarioController.modificarLogro);

router
  .route('/:codigo/cv/producto')
  .get(usuarioController.validarAlcance, usuarioController.getProductos)
  .put(usuarioController.validarAlcance, usuarioController.modificarProducto);

module.exports = router;
