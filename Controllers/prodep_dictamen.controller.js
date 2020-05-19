const Trabajador = require('../Models/trabajador.model');
const fs = require('fs').promises;
const catchAsync = require('../Helpers/catchAsync');
const AppError = require('../Helpers/appError');

module.exports.subirDictamen = catchAsync(async (req, res, next) => {
  const resp = await Trabajador.findOne({codigo: req.params.codigo});
  if(!resp)
  {
    return next(
      new AppError(
          'El codigo no esta en la base de datos',
          400
        )
    );
  }
  const laboral = resp.laboral.contratos_academicos[resp.laboral.contratos_academicos.length - 1];
  if(resp.status === "activo" && laboral.temporalidad === "tiempo completo")
  {
    const dir = `./Files/uploads/${req.params.codigo}/dictamenes/`;
    var dictamenDigitalizado = req.file.originalname;
    var fileType = req.file.mimetype;
    await fs.mkdir(dir, { recursive: true }, err =>{
    	if (err) {
            return next(
              new AppError('Error al crear la carpeta', 500)
            );
          }
        }
    );
    await fs
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
    const buffer = await fs.readFile(dir + dictamenDigitalizado);
    if(!buffer)
    {
      return next(
          new AppError('El archivo no existe en el directorio', 500)
      );
    }
    var last = resp.prodep.length-1;
    resp.prodep[last].dictamen_digitalizado.archivo = buffer;
    resp.prodep[last].dictamen_digitalizado.extension_archivo = fileType;
    const PROD = await resp.save();
    if (!PROD)
    {
        return next(
            new AppError('Error al guardar el documento', 500)
        );
    }
    const prod = resp.prodep[last];
    res.status(200).json({ok: true, prod});
  }
  else
    {
      return next(
        new AppError('El profesor no es de tiempo completo o no esta activo en SIIPERSU', 400)
      );
    }
});

module.exports.actualizarDictamen = catchAsync(async(req, res, next)=>{
  const resp = await Trabajador.findOne({codigo: req.params.codigo});
  var laboral = resp.laboral.contratos_academicos[resp.laboral.contratos_academicos.length - 1];
  if(resp.status === "activo" && laboral.temporalidad === "tiempo completo"){
    const dir = `./Files/uploads/${req.params.codigo}/dictamenes/`;
    const dictamenDigitalizado = req.file.originalname;
    var fileType = req.file.mimetype;
    await fs
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
    const buffer = await fs.readFile(dir + dictamenDigitalizado);
    if(!buffer)
    {
      return next(
          new AppError('El archivo no existe en el directorio', 500)
      );
    }
    var last = resp.prodep.length-1;
    resp.prodep[last].dictamen_digitalizado.archivo = buffer;
    resp.prodep[last].dictamen_digitalizado.extension_archivo = fileType;
    const PROD = await resp.save();
    if(!PROD)
    {
      return next(
          new AppError('No se encontro el documento en la BD', 500)
      );
    }
    const prod = resp.prodep[last];
    res.status(200).json({ok: true, prod});
  }
  else
    {
      return next(
        new AppError('El profesor no es de tiempo completo o no esta activo en SIIPERSU', 400)
      );
    }
});

module.exports.descargarDictamen = catchAsync(async(req, res, next)=>{
  const codigo = req.params.codigo;
  const dir = `./Files/temp/${codigo}.pdf`;
  const WK = await Trabajador.findOne({codigo: codigo});
  if(!WK)
  {
    return next(
      new AppError('No se encontro el trabajador', 400)
    );
  }
  var last = WK.prodep.length-1;
  const buffer = WK.prodep[last].dictamen_digitalizado.archivo;
  await fs.writeFile(dir, buffer, err =>{
    if (err) {
          return next(
            new AppError('Error al escribir el archivo', 500)
          );
        }
      }
    );
  res.status(200).download(dir, `Dictamen${codigo}.pdf`, function(err){
    fs.unlink(dir);
  });
});

module.exports.verDictamen = catchAsync(async(req, res, next)=>{
  const resp = await Trabajador.findOne({codigo: req.params.codigo});
  if(!resp)
  {
    return next(
      new AppError('No se encontro el trabajador', 400)
    );
  }
  var last = resp.prodep.length - 1;
  const dic = resp.prodep[last].dictamen_digitalizado;
  if(!dic)
  {
    return next(
      new AppError('No se encontro algun dictamen', 400)
    );
  }
  res.status(200).json({ok: true, dic});
});
