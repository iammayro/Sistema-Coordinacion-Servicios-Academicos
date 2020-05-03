const CuerpoAcademico = require('../Models/CA.model');
const fsp = require('fs').promises;
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');

module.exports.postCuerpoAcademicoExp = catchAsync(async (req, res,next) => {
        const dir = `./Files/uploads/${req.params.id}/expediente/`;
        const expedienteDigitalizado = req.file.originalname;
        await fsp.mkdir(dir, {recursive: true}, err =>{
        if (err) {
            return next(
              new AppError('Error al crear la carpeta', 500)
            );
          }
        }
        );
        await fsp.rename(`./Files/uploads/${expedienteDigitalizado}`, dir + expedienteDigitalizado, err =>{
        if (err) {
            return next(
              new AppError('Error al mover o sobreescribir el archivo', 500)
            );
          }
        }
        );
        const buffer = await fsp
          .readFile(dir + expedienteDigitalizado);
        if(!buffer)
            {
            return next(
              new AppError('Error al leer el documento', 500)
            );
          }
        const resp = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!resp)
            {
            return next(
              new AppError('No se encuentra el documento en la BD', 500)
            );
          }
        resp.expediente_digitalizado = buffer;
        const CA = await resp.save();
        if(!CA)
            {
            return next(
              new AppError('Error al guardar documento', 500)
            );
          }
        res.status(200).json({ok: true, CA});
    
});

module.exports.putCuerpoAcademicoExp = catchAsync(async (req, res,next) => {
        const dir = `./Files/uploads/${req.params.id}/expediente/`;
        const expedienteDigitalizado = req.file.originalname;
        await fsp.rename(`./Files/uploads/${expedienteDigitalizado}`, dir + expedienteDigitalizado, err =>{
        if (err) {
            return next(
              new AppError('Error al mover o sobreescribir el archivo', 500)
            );
          }
        }
        );
        const buffer = await fsp
          .readFile(dir + expedienteDigitalizado);
        if(!buffer)
            {
            return next(
              new AppError('Error al leer el documento', 500)
            );
          }
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
             {
            return next(
              new AppError('No se encuentra el documento en la BD', 500)
            );
          }
        CA.expediente_digitalizado = buffer;
        const resp = await CA.save();
        if(!resp)
             {
            return next(
              new AppError('Error al guardar el documento', 500)
            );
          }
        res.status(200).json({ok: true, resp});
    
});

module.exports.getCuerpoAcademicoExp = catchAsync(async (req, res,next) => {
        const codigo = req.params.id;
        const dir = `./Files/temp/${codigo}.pdf`;
        const CA = await CuerpoAcademico.findOne({clave: codigo});
        const buffer = CA.expediente_digitalizado;
        await fsp.writeFile(dir, buffer, err =>{
        if (err) {
            return next(
              new AppError('Error al escribir el archivo', 500)
            );
          }
        }
        );
        res.status(200).download(dir, `Expediente${codigo}.pdf`, function(err){
            fsp.unlink(dir);
        });
    
});