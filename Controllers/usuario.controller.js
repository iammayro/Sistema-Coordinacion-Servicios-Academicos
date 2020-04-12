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
