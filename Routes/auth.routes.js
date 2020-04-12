const express = require('express');
const authController = require('../Controllers/auth.controller');

const router = express.Router();

router.post('/iniciar', authController.iniciarSesion);
router.post('/recuperar', authController.recuperarContrasena);
router.post('/validar', authController.validarToken);
router.put('/cambiar', authController.cambiarContrasena);

module.exports = router;
