const sharp = require('sharp');
const saveBuffer = require('save-buffer');
const fs = require('fs');

const Trabajador = require('../Models/trabajador.model');
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');
const multer = require('../Middlewares/multer');

// multer es una libreria para el manejo de archivos,
// internamente agrega la foto al req.file, como todo middleware, continua con el siguiente
exports.subirFotoPerfil = multer.uploadImage.single('foto_perfil');

exports.subirArchivo = function(nombreCampo) {
  return multer.uploadFileRam.single(nombreCampo);
};

exports.eliminarArchivoPrevio = function(nombreCampo, tipoArchivo) {
  return catchAsync(async (req, res, next) => {
    if (!res.locals.usuarioAModificar.personal[nombreCampo]) {
      return next();
    }
    if (tipoArchivo === 'imagen') {
      if (
        res.locals.usuarioAModificar.personal[nombreCampo] === 'default.png'
      ) {
        return next();
      }
      await fs.unlink(
        `./Files/uploads/users/images/${res.locals.usuarioAModificar.personal[nombreCampo]}`,
        err => {
          if (err) {
            return next(
              new AppError('Algo salio mal al borrar el antiguo archivo', 500)
            );
          }
        }
      );
      return next();
    }
    if (tipoArchivo === 'doc') {
      await fs.unlink(
        `./Files/uploads/users/docs/${res.locals.usuarioAModificar.personal[nombreCampo]}`,
        err => {
          if (err) {
            return next(
              new AppError('Algo salio mal al borrar el antiguo archivo', 500)
            );
          }
        }
      );
      return next();
    }
    next();
  });
};

exports.guardarArchivo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError('Algo salio mal al subir archivo, intentalo de nuevo', 400)
    );
  }
  const extension = req.file.mimetype.split('/')[1];
  req.file.filename = `${req.user.id}-${Date.now()}.${extension}`;
  await saveBuffer(
    req.file.buffer,
    `./Files/uploads/users/docs/${req.file.filename}`
  );
  next();
});

// Este middleware nos sirve para redimencionar todas las fotos, y asi ahorrar espacio de
// almacenamiento en el servidor, fijo a 600 x 600 pixeles en formato jpeg
exports.redimencionarFoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError('Algo salio mal al subir archivo, intentalo de nuevo', 400)
    );
  }
  // el nombre de la imagen esta en formato id, timestamp de este momento
  req.file.filename = `${req.user.id}-${Date.now()}.jpeg`;

  // sharp es la libreria que nos permite la redimension de imagenes
  sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`Files/uploads/users/images/${req.file.filename}`);

  next();
});

exports.getUsuarios = catchAsync(async (req, res, next) => {
  const trabajadores = await Trabajador.find();
  if (!trabajadores) {
    return next(new AppError('Base de datos sin trabajadores', 401));
  }
  res.status(200).json({
    ok: true,
    results: trabajadores.length,
    data: {
      trabajador: trabajadores
    }
  });
});

// Al ser una ruta donde el coordinador puede modificar a todos los demas, hay que
// verificar que no sea un maestro el que intenta modificar a otro usuario
exports.validarAlcance = catchAsync(async (req, res, next) => {
  // validar si el que hizo la request es maestro o coordinador
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const usuarioPeticion = req.user;
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
  res.locals.usuarioAModificar = usuarioAModificar;
  next();
});

exports.modificarUsuario = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const body = { ...req.body };
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const usuarioPeticion = { ...req.user._doc };
  const { usuarioAModificar } = res.locals;
  // ningun usuario puede cambiarse el codigo o el tipo, si se equivoco,
  // modificar en la base de datos directamente
  // si el que hizo la peticion no es coordinador (es maestro o jefe de departamento)
  const llaves = Object.keys(body);
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
      'nip',
      'direccion_nacimiento',
      'direccion_actual',
      'passwordChangedAt',
      'passwordResetToken',
      'passwordResetExpires'
    ];
  } else {
    // si es coordinador puede modificar todo a el mismo o a quien sea excepto lo vital
    eleProhibidos = [
      'codigo',
      'nip',
      'tipo',
      'passwordChangedAt',
      'passwordResetToken',
      'passwordResetExpires'
    ];
  }
  // eliminamos los atributos que no deben ser modificados
  llaves.forEach(element => {
    if (eleProhibidos.includes(element)) {
      delete body[element];
    }
  });
  // si tiene la imagen, la agregamos al body, para este punto ya se creo en el filesystem
  if (req.file) {
    if (!body.personal) {
      body.personal = res.locals.usuarioAModificar.personal;
    }
    body.personal[req.file.fieldname] = req.file.filename;
  }
  console.log(body, req.file.fieldname);
  // si todo salio bien, modificar al usuario
  const trabajador = await Trabajador.findByIdAndUpdate(
    usuarioAModificar._id,
    body,
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
