const CuerpoAcademico = require('../Models/CA.model');
const Trabajador = require('../Models/trabajador.model');
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');

module.exports.postCuerpoAcademicoIntegrante = catchAsync(async (req, res) => {
        const trabajador = await Trabajador.findOne({codigo: req.body.codigo});
        if(!trabajador)
            {
            return next(
              new AppError('No se existe el trabajador', 400)
            );
          }
        var integrante = {integrante: trabajador._id, tipo: req.body.tipo};
        const inscrito = await CuerpoAcademico.findOne({integrantes: {$in: trabajador._id}});
        if(inscrito)
            {
            return next(
              new AppError('El trabajador ya esta inscrito en un Cuerpo Academico', 400)
            );
          }
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
            {
            return next(
              new AppError('No se encuentra el documento en la BD', 400)
            );
          }
        CA.integrantes.push(integrante);
        const resp = await CA.save();
        if (!resp)
            {
            return next(
              new AppError('Error al guardar el documento', 500)
            );
          }
        res.status(200).json({ok: true, resp});

});

module.exports.deleteCuerpoAcademicoIntegrante = catchAsync(async (req, res) => {
        const trabajador = await Trabajador.findOne({codigo: req.body.codigo});
        if(!trabajador)
            {
            return next(
              new AppError('No se existe el trabajador', 400)
            );
          }
        const idIntegrante =  trabajador._id ;
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
            {
            return next(
              new AppError('No se encuentra el docmuento en la BD', 400)
            );
          }
        CA.integrantes.remove(idIntegrante);
        const resp = await CA.save();
        if (!resp)
            {
            return next(
              new AppError('Error al guardar el documento', 500)
            );
          }
        res.status(200).json({ok: true, resp});

});