const sharp = require('sharp');
const saveBuffer = require('save-buffer');
const fs = require('fs');

const Trabajador = require('../Models/trabajador.model');
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');
const multer = require('../Middlewares/multer');

// Al ser una ruta donde el coordinador puede modificar a todos los demas, hay que
// verificar que no sea un maestro el que intenta modificar a otro usuario
exports.validarAlcance = catchAsync(async (req, res, next) => {
  // validar si el que hizo la request es maestro o coordinador
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
  const usuarioSolicitado = await Trabajador.findOne({
    codigo: req.params.codigo
  });
  if (!usuarioSolicitado) {
    return next(
      new AppError(
        'Este usuario no existe en la base de datos, intenta con uno nuevo',
        404
      )
    );
  }
  if (usuarioPeticion.tipo !== 'coordinador de personal') {
    if (usuarioPeticion.codigo !== req.params.codigo) {
      return next(new AppError('No tienes acceso a estos datos', 401));
    }
  }
  res.locals.usuarioSolicitado = usuarioSolicitado;
  next();
});

// multer es una libreria para el manejo de archivos,
// internamente agrega la foto al req.file, como todo middleware, continua con el siguiente
exports.subirFotoPerfil = multer.uploadImage.single('foto_perfil');

exports.subirArchivo = function(nombreCampo) {
  return multer.uploadFileRam.single(nombreCampo);
};

exports.eliminarArchivoPrevio = function(nombreCampo, tipoArchivo) {
  return catchAsync(async (req, res, next) => {
    if (!res.locals.usuarioSolicitado.personal[nombreCampo]) {
      return next();
    }
    if (tipoArchivo === 'imagen') {
      if (
        res.locals.usuarioSolicitado.personal[nombreCampo] === 'default.png'
      ) {
        return next();
      }
      await fs.unlink(
        `./Files/uploads/users/images/${res.locals.usuarioSolicitado.personal[nombreCampo]}`,
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
        `./Files/uploads/users/docs/${res.locals.usuarioSolicitado.personal[nombreCampo]}`,
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
      new AppError(
        'Algo salio mal al subir el archivo, intentalo de nuevo',
        400
      )
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
      new AppError(
        'Algo salio mal al subir el archivo, intentalo de nuevo',
        400
      )
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

exports.modificarUsuario = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const body = { ...req.body };
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const usuarioPeticion = { ...req.user._doc };
  const { usuarioSolicitado } = res.locals;
  // hay informacion que el usuario tipo maestro tiene prohibido modificar
  if (usuarioPeticion.tipo !== 'coordinador de personal') {
    delete body.status;
    delete body.codigo;
    delete body.tipo;
    delete body.nip;
    delete body.personal;
    delete body.direccion_nacimiento;
    delete body.direccion_actual;
    delete body.passwordChangedAt;
    delete body.passwordResetToken;
    delete body.passwordResetExpire;
  } else {
    // si es coordinador puede modificar todo a el mismo o a quien sea excepto lo vital
    delete body.codigo;
    delete body.nip;
    delete body.tipo;
    delete body.passwordChangedAt;
    delete body.passwordResetToken;
    delete body.passwordResetExpires;
  }
  // si tiene la imagen, la agregamos al body, para este punto ya se creo en el filesystem
  if (req.file) {
    if (!body.personal) {
      body.personal = res.locals.usuarioSolicitado.personal;
    }
    body.personal[req.file.fieldname] = req.file.filename;
  }
  // si todo salio bien, modificar al usuario
  const trabajador = await Trabajador.findByIdAndUpdate(
    usuarioSolicitado._id,
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
  if (!req.body.status) {
    req.body.status = 'finado';
  }
  const trabajador = await Trabajador.findOneAndUpdate(
    { codigo: res.locals.usuarioSolicitado.codigo },
    { status: req.body.status },
    { new: true }
  );
  res.status(204).json({
    ok: true,
    data: {
      trabajador
    }
  });
});

exports.mostrarUsuario = catchAsync(async (req, res, next) => {
  const trabajador = res.locals.usuarioSolicitado;
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      trabajador
    }
  });
});

exports.getIdiomas = catchAsync(async (req, res, next) => {
  let { idiomas } = res.locals.usuarioSolicitado.curriculum;
  if (!idiomas) {
    idiomas = [];
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      idiomas
    }
  });
});

exports.agregarIdioma = catchAsync(async (req, res, next) => {
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $push: { 'curriculum.idiomas': req.body } },
    { new: true, runValidators: true }
  );
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      idiomas: trabajadorAct.curriculum.idiomas
    }
  });
});

exports.borrarIdioma = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id del idioma a eliminar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $pull: { 'curriculum.idiomas': { _id: req.params.id } } },
    { new: true }
  );
  if (
    trabajador.curriculum.idiomas.length ===
    trabajadorAct.curriculum.idiomas.length
  ) {
    return next(
      new AppError(
        'El id ingresado no existe o no fue encontrado en la coleccion',
        400
      )
    );
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(204).json({
    ok: true,
    data: {
      idiomas: trabajadorAct.curriculum.idiomas
    }
  });
});

exports.modificarIdioma = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id del idioma a modificar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;

  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo, 'curriculum.idiomas._id': req.params.id },
    { 'curriculum.idiomas.$': req.body },
    { new: true, runValidators: true }
  );
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      idiomas: trabajadorAct.curriculum.idiomas
    }
  });
});

exports.getProgramas = catchAsync(async (req, res, next) => {
  let { programas } = res.locals.usuarioSolicitado.curriculum;
  if (!programas) {
    programas = [];
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      programas
    }
  });
});

exports.agregarPrograma = catchAsync(async (req, res, next) => {
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $push: { 'curriculum.programas': req.body } },
    { new: true, runValidators: true }
  );
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      programas: trabajadorAct.curriculum.programas
    }
  });
});

exports.borrarPrograma = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id del programa a eliminar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $pull: { 'curriculum.programas': { _id: req.params.id } } },
    { new: true }
  );
  if (
    trabajador.curriculum.programas.length ===
    trabajadorAct.curriculum.programas.length
  ) {
    return next(
      new AppError(
        'El id ingresado no existe o no fue encontrado en la coleccion',
        400
      )
    );
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(204).json({
    ok: true,
    data: {
      programas: trabajadorAct.curriculum.programas
    }
  });
});

exports.modificarPrograma = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id del programa a modificar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;

  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo, 'curriculum.programas._id': req.params.id },
    { 'curriculum.programas.$': req.body },
    { new: true, runValidators: true }
  );
  if (!trabajadorAct) {
    return next(new AppError('Id o valor invalido', 400));
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      programas: trabajadorAct.curriculum.programas
    }
  });
});

exports.getPosiciones = catchAsync(async (req, res, next) => {
  let posiciones = res.locals.usuarioSolicitado.curriculum.posiciones_trabajo;
  if (!posiciones) {
    posiciones = [];
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      posiciones
    }
  });
});

exports.agregarPosicion = catchAsync(async (req, res, next) => {
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $push: { 'curriculum.posiciones_trabajo': req.body } },
    { new: true, runValidators: true }
  );
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      posiciones: trabajadorAct.curriculum.posiciones_trabajo
    }
  });
});

exports.borrarPosicion = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id de la posicion a eliminar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $pull: { 'curriculum.posiciones_trabajo': { _id: req.params.id } } },
    { new: true }
  );
  if (
    trabajador.curriculum.posiciones_trabajo.length ===
    trabajadorAct.curriculum.posiciones_trabajo.length
  ) {
    return next(
      new AppError(
        'El id ingresado no existe o no fue encontrado en la coleccion',
        400
      )
    );
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(204).json({
    ok: true,
    data: {
      posiciones: trabajadorAct.curriculum.posiciones_trabajo
    }
  });
});

exports.modificarPosicion = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id de la posicion a modificar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;

  const trabajadorAct = await Trabajador.findOneAndUpdate(
    {
      codigo: trabajador.codigo,
      'curriculum.posiciones_trabajo._id': req.params.id
    },
    { 'curriculum.posiciones_trabajo.$': req.body },
    { new: true, runValidators: true }
  );
  if (!trabajadorAct) {
    return next(new AppError('Id o valor invalido', 400));
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      posiciones: trabajadorAct.curriculum.posiciones_trabajo
    }
  });
});

exports.getLogros = catchAsync(async (req, res, next) => {
  let { logros } = res.locals.usuarioSolicitado.curriculum;
  if (!logros) {
    logros = [];
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      logros
    }
  });
});

exports.agregarLogro = catchAsync(async (req, res, next) => {
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $push: { 'curriculum.logros': req.body } },
    { new: true, runValidators: true }
  );
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      logros: trabajadorAct.curriculum.logros
    }
  });
});

exports.borrarLogro = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id del logro a eliminar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;
  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { $pull: { 'curriculum.logros': { _id: req.params.id } } },
    { new: true }
  );
  if (
    trabajador.curriculum.logros.length ===
    trabajadorAct.curriculum.logros.length
  ) {
    return next(
      new AppError(
        'El id ingresado no existe o no fue encontrado en la coleccion',
        400
      )
    );
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(204).json({
    ok: true,
    data: {
      logros: trabajadorAct.curriculum.logros
    }
  });
});

exports.modificarLogro = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(
      new AppError('Debe proporcionar el id del logro a modificar', 400)
    );
  }
  const trabajador = res.locals.usuarioSolicitado;

  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo, 'curriculum.logros._id': req.params.id },
    { 'curriculum.logros.$': req.body },
    { new: true, runValidators: true }
  );
  if (!trabajadorAct) {
    return next(new AppError('Id o valor invalido', 400));
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      logros: trabajadorAct.curriculum.logros
    }
  });
});

exports.getProductos = catchAsync(async (req, res, next) => {
  let { productos } = res.locals.usuarioSolicitado.curriculum;
  if (!productos) {
    productos = [];
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      productos
    }
  });
});

exports.modificarProducto = catchAsync(async (req, res, next) => {
  const trabajador = res.locals.usuarioSolicitado;

  const trabajadorAct = await Trabajador.findOneAndUpdate(
    { codigo: trabajador.codigo },
    { 'curriculum.productos': req.body },
    { new: true, runValidators: true }
  );
  if (!trabajadorAct) {
    return next(new AppError('Id o valor invalido', 400));
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  res.status(200).json({
    ok: true,
    data: {
      productos: trabajadorAct.curriculum.productos
    }
  });
});
