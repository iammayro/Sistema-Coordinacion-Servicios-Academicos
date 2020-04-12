const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Trabajador = require('../Models/trabajador.model');
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');
// const sendEmail = require('./../utils/email');

const crearToken = (id, tipo) => {
  return jwt.sign(
    {
      id,
      tipo
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JTW_EXPIRES_IN
    }
  );
};

const mandarToken = (user, statusCode, res) => {
  const token = crearToken(user._id, user.tipo);
  res.status(statusCode).json({
    ok: true,
    token,
    data: {
      user
    }
  });
};

exports.crearUsuario = catchAsync(async (req, res, next) => {
  // pendiente definir si crear al trabajador con privilejios de administrador o no
  // ...
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const trabajador = await Trabajador.create({ ...req.body });
  res.status(201).json({
    ok: true,
    data: {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      trabajador
    }
  });
});

exports.iniciarSesion = catchAsync(async (req, res, next) => {
  const { codigo, nip } = req.body;
  // verificar que manden los datos correctos
  if (!codigo || !nip) {
    return next(
      new AppError('Por favor ingresa un codigo y una contraseña!', 400)
    );
  }
  // verificar si existen en la base de datos
  const user = await Trabajador.findOne({
    codigo
  }).select('+nip');
  // si no existe el usuario o el nip es incorrecto
  if (!user || !(await user.compararNip(nip, user.nip))) {
    return next(new AppError('Datos incorrectos: nip o codigo', 401));
  }
  // si todo salio bien, mandar token
  mandarToken(user, 200, res);
});

const isTokenValido = async (req, res, next) => {
  // Obtener solicitud y revisar que existe el token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return {
      isValid: false,
      user: null,
      message: 'No se ha mandado un token, por favor inicia sesion',
      status: 401
    };
  }
  // decodificar el token recibido
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Verifica si el id del token existe
  const currentTrabajador = await Trabajador.findById(decoded.id);
  if (!currentTrabajador) {
    return {
      isValid: false,
      user: null,
      message: 'No se encontro un usuario con este id, verifica de nuevo!',
      status: 401
    };
  }
  // Verificar si por cualquier cosa el usuario no cambio la contraseña despues de recibir el token
  if (currentTrabajador.changedPasswordAfter(decoded.iat)) {
    return {
      isValid: false,
      user: null,
      message:
        'El usuario recientemente cambio la contraseña. Volver a iniciar sesión!',
      status: 401
    };
  }
  console.log('usuario:', currentTrabajador._id);
  return { isValid: true, user: currentTrabajador, message: '', status: 200 };
};

exports.validarToken = catchAsync(async (req, res, next) => {
  // Obtener solicitud y revisar que existe el token
  const validacion = await isTokenValido(req, res, next);
  if (validacion.isValid) {
    return res.status(200).json({
      ok: true,
      trabajador: validacion.user
    });
  }
  // si es invalido regresar mensaje
  next(new AppError(validacion.message, validacion.status));
});

exports.protect = catchAsync(async (req, res, next) => {
  // Obtener solicitud y revisar que existe el token
  const validacion = await isTokenValido(req, res, next);
  if (validacion.isValid) {
    req.user = validacion.user;
    return next(); // continua con el siguiente middleware
  }
  // error, token no valido
  next(new AppError(validacion.message, validacion.status));
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.recuperarContrasena = catchAsync(async (req, res, next) => {
  // Obtengo el usuario basado en los parametros establecidos (codigo, imss, rfc)
  const user = await Trabajador.findOne({
    codigo: req.body.codigo,
    'personal.imss': req.body.imss,
    'personal.rfc': req.body.rfc
  });
  if (!user) {
    return next(new AppError('Datos invalidos, abortando.', 404));
  }

  // Generar el nuevo token random
  const resetToken = user.crearTokenRestauracion();
  // esto apaga todos los validators
  await user.save({
    validateBeforeSave: false
  });

  // respuesta
  res.status(200).json({
    ok: true,
    message: 'El token expirara dentro de 10 minutos!',
    validation_code: resetToken
  });
});

exports.cambiarContrasena = catchAsync(async (req, res, next) => {
  // Obtengo al usuario basado en el token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.validation_code)
    .digest('hex');

  const user = await Trabajador.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // Si el token no ha expirado y el usuario existe entonces creo un nuevo nip
  if (!user) {
    return next(new AppError('El token es invalido o ha expirado', 400));
  }
  user.nip = req.body.nip;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // actualizar campo changePasswordAt para el trabajador
  await user.save();
  // iniciar sesion, mandar JWT
  mandarToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await Trabajador.findById(req.user.id).select('+password');
  // check if posted password is correct
  if (!user.compararNip(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // if password is correct, then update
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log user in, send JWT
  mandarToken(user, 200, res);
});
