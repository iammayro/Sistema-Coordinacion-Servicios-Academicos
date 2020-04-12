const Trabajador = require('../Models/trabajador.model');
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');

exports.getUsuarios = catchAsync(async (req, res, next) => {
  const trabajador = await Trabajador.find();
  if (!trabajador) {
    return next(new AppError('Base de datos sin trabajadores', 401));
  }
  res.status(200).json({
    ok: true,
    results: trabajador.length,
    data: {
      trabajador
    }
  });
});

exports.modificarUsuario = catchAsync(async (req, res, next) => {
  // validar si el que hizo la request es maestro o coordinador
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const usuarioPeticion = { ...req.user._doc };
  if (!usuarioPeticion) {
    return next(
      new AppError('Algo salio mal con el Token, inicia sesion nuevamente', 500)
    );
  }
  const usuarioAModificar = await Trabajador.findOne({
    codigo: req.params.codigo
  });
  if (!usuarioAModificar) {
    return next(
      new AppError(
        'Este usuario no existe en la base de datos, intenta con uno nuevo',
        404
      )
    );
  }
  // ningun usuario puede cambiarse el codigo o el tipo, si se equivoco,
  // modificar en la base de datos directamente
  // si el que hizo la peticion no es coordinador (es maestro o jefe de departamento)
  const llaves = Object.keys(req.body);
  let eleProhibidos;
  if (usuarioPeticion.tipo !== 'coordinador de personal') {
    // si es maestro solo puede modificarse a si mismo y algunos atributos
    if (usuarioPeticion.codigo !== usuarioAModificar.codigo) {
      return next(new AppError('No puedes modificar a otro usuario', 401));
    }
    eleProhibidos = [
      'status',
      'codigo',
      'tipo',
      'direccion_nacimiento',
      'direccion_actual',
      'personal',
      'passwordChangedAt',
      'passwordResetToken',
      'passwordResetExpires'
    ];
  } else {
    // si es coordinador puede modificar todo a el mismo o a quien sea
    eleProhibidos = [
      'codigo',
      'tipo',
      'passwordChangedAt',
      'passwordResetToken',
      'passwordResetExpires'
    ];
  }
  llaves.forEach(element => {
    if (eleProhibidos.includes(element)) {
      return next(
        new AppError(`No puedes modificar la propiedad ${element}`, 401)
      );
    }
  });
  // si todo salio bien, modificar al usuario
  const trabajador = await Trabajador.findByIdAndUpdate(
    usuarioAModificar._id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).json({
    ok: true,
    data: {
      trabajador
    }
  });
});

exports.borrarUsuario = catchAsync(async (req, res, next) => {
  const trabajador = await Trabajador.findOneAndUpdate(
    { codigo: req.params.codigo },
    { status: req.body.status },
    {
      new: true,
      runValidators: true
    }
  );
  if (!trabajador) {
    return next(
      new AppError('Este usuario no existe, vuelve a intentarlo', 404)
    );
  }
  res.status(204).json({
    ok: true,
    data: {
      trabajador
    }
  });
});

exports.mostrarUsuario = catchAsync(async (req, res, next) => {
  const trabajador = await Trabajador.findOne({ codigo: req.params.codigo });
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const usuarioPeticion = { ...req.user._doc };
  if (!usuarioPeticion) {
    return next(
      new AppError(
        'Algo salio mal con las credenciales, vuelve a iniciar sesion',
        511
      )
    );
  }
  if (usuarioPeticion.tipo !== 'coordinador de personal') {
    if (usuarioPeticion.codigo !== req.params.codigo) {
      return next(new AppError('No tienes acceso a estos datos', 401));
    }
  }
  res.status(200).json({
    ok: true,
    data: {
      trabajador
    }
  });
});
