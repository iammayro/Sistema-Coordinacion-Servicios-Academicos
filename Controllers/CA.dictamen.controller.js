const CuerpoAcademico = require('../Models/CA.model');
const fsp = require('fs').promises;
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');

module.exports.postCuerpoAcademicoDic = catchAsync(async (req, res, next) => {
    const dir = `./Files/uploads/${req.params.id}/dictamenes/`;
    const dictamenDigitalizado = req.file.originalname;
    await fsp.mkdir(dir, { recursive: true }, err =>{
    	if (err) {
            return next(
              new AppError('Error al crear la carpeta', 500)
            );
          }
        }
    );
    await fsp
      .rename(
        `./Files/uploads/${dictamenDigitalizado}`,
        dir + dictamenDigitalizado, err =>{
    	if (err) {
            return next(
              new AppError('Error al mover o sobreescribir el archivo', 500)
            );
          }
        }
    );
    const buffer = await fsp.readFile(dir + dictamenDigitalizado);
    if (!buffer)
    {
        return next(
            new AppError('El archivo no existe en el directorio', 500)
        );
    }
    const resp = await CuerpoAcademico.findOne({ clave: req.params.id });
    if (!resp)
    {
        return next(
            new AppError('No existe el docmuento en la BD', 400)
        );
    }
    var dictamen = {dictamen: buffer};
    resp.dictamen_digitalizado.push(dictamen);
    const CA = await resp.save();
    if (!CA)
    {
        return next(
            new AppError('Error al guardar el documento', 500)
        );
    }
    res.status(200).json({ ok: true, CA });
});

module.exports.putCuerpoAcademicoDic = catchAsync(async (req, res, next) => {
    const dir = `./Files/uploads/${req.params.id}/dictamenes/`;
    const dictamenDigitalizado = req.file.originalname;
    await fsp
      .rename(
        `./Files/uploads/${dictamenDigitalizado}`,
        dir + dictamenDigitalizado, err =>{
    	if (err) {
            return next(
              new AppError('Error al mover o sobreescribir el archivo', 500)
            );
          }
        }
    );
    const buffer = await fsp.readFile(dir + dictamenDigitalizado);
    if (!buffer)
    {
        return next(
            new AppError('El archivo no existe en el directorio', 500)
        );
    }
    const CA = await CuerpoAcademico.findOneAndUpdate(
    	{ clave: req.params.id, 'dictamen_digitalizado._id': req.params.id_dictamen },
    	{ 'dictamen_digitalizado.$.dictamen': buffer },
    	{new: true, runValidators: true}
    );
    if(!CA)
        return next(
            new AppError('No se encontro el documento en la BD', 500)
        );
    res.status(200).json({ ok: true, CA });
  
});

module.exports.getCuerpoAcademicoDic = catchAsync(async (req, res,next) => {
    const codigo = req.params.id;
    const dir = `./Files/temp/${codigo}.pdf`;
    const CA = await CuerpoAcademico.findOne({ clave: codigo, 'dictamen_digitalizado._id': req.params.id_dictamen},{'dictamen_digitalizado.$': 1});
    const buffer = CA.dictamen_digitalizado[0].dictamen;
    await fsp.writeFile(dir, buffer, err =>{
    	if (err) {
            return next(
              new AppError('Error al escribir el archivo', 500)
            )
          }
        }
    );
    res.status(200).download(dir, `Dictamen${codigo}.pdf`, function(err) {
      fsp.unlink(dir);
    });
});
