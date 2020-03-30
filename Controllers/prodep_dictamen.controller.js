const Trabajador = require('../Models/trabajador.model');
const fs = require('fs').promises;

  module.exports.subirDictamen = async(req, res)=>{
    try {
      const resp = await Trabajador.findOne({codigo: req.params.codigo});
      var laboral = resp.laboral.contratos_academicos[resp.laboral.contratos_academicos.length - 1];
      if(resp.status === "activo" && laboral.temporalidad === "tiempo completo"){
        var dir = "./Files/uploads/" + req.params.codigo + "/dictamenes/";
        var dictamenDigitalizado = req.file.originalname;
        var fileType = req.file.mimetype;
        var errorH;
        await fs.mkdir(dir, {recursive: true}).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        await fs.rename('./Files/uploads/'+dictamenDigitalizado, dir + dictamenDigitalizado).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        const buffer = await fs.readFile(dir + dictamenDigitalizado);
        if(!buffer)
            return res.json({ok: false, message: 'No existe el archivo'});
        var last = resp.prodep.length-1;
        resp.prodep[last].dictamen_digitalizado.archivo = buffer;
        resp.prodep[last].dictamen_digitalizado.extension_archivo = fileType;
        await resp.save();
        const prod = resp.prodep[last];
        res.json({ok: true, prod});
      }else{
        res.json({ok: false, message: 'El profesor no es de tiempo completo o no esta activo en SIIPERSU'});
      }
    } catch (error) {
        res.json({ok: false, error});
    }
  }

  module.exports.actualizarDictamen = async(req, res)=>{
    try {
      const resp = await Trabajador.findOne({codigo: req.params.codigo});
      var laboral = resp.laboral.contratos_academicos[resp.laboral.contratos_academicos.length - 1];
      if(resp.status === "activo" && laboral.temporalidad === "tiempo completo"){
        var dir = './Files/uploads/'+req.params.codigo+'/dictamenes/';
        var dictamenDigitalizado = req.file.originalname;
        var errorH;
        await fs.rename('./Files/uploads/'+dictamenDigitalizado, dir + dictamenDigitalizado).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        const buffer = await fs.readFile(dir + dictamenDigitalizado);
        if(!buffer)
            return res.json({ok: false, message: 'No existe el archivo'});
        var last = resp.prodep.length-1;
        resp.prodep[last].dictamen_digitalizado.archivo = buffer;
        resp.prodep[last].dictamen_digitalizado.extension_archivo = fileType;
        await resp.save();
        const prod = resp.prodep[last];
        res.json({ok: true, prod});
      }else{
        res.json({ok: false, message: 'El profesor no es de tiempo completo o no esta activo en SIIPERSU'});
      }
    } catch (error) {
        res.json({ok: false, error});
    }
  }

  module.exports.descargarDictamen = async(req, res)=>{
    try {
        var codigo = req.params.codigo;
        var dir = './Files/temp/'+codigo+'.pdf';
        const WK = await Trabajador.findOne({codigo: codigo});
        var last = WK.prodep.length-1;
        const buffer = WK.prodep[last].dictamen_digitalizado.archivo;
        var errorH;
        await fs.writeFile(dir, buffer).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        res.download(dir, 'Dictamen'+codigo+'.pdf', function(err){
            fs.unlink(dir);
        });
    } catch (error) {
        res.json({ok: false, error});
    }
  }

  module.exports.verDictamen = async(req, res)=>{
    try {
        const resp = await Trabajador.findOne({codigo: req.params.codigo});
        var last = resp.prodep.length - 1;
        const dic = resp.prodep[last].dictamen_digitalizado;
        res.json({ok: true, dic});
    } catch (error) {
        res.json({ok: false, error});
    }
  }
