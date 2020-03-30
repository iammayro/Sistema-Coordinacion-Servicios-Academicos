const Trabajador = require('../Models/trabajador.model');
const fs = require('fs').promises;

  module.exports.subirExpediente = async(req, res)=>{
    try {
      const resp = await Trabajador.findOne({codigo: req.params.codigo});
      var laboral = resp.laboral.contratos_academicos[resp.laboral.contratos_academicos.length - 1];
      if(resp.status === "activo" && laboral.temporalidad === "tiempo completo"){
        var dir = "./Files/uploads/" + req.params.codigo + "/expediente/";
        var expedienteDigitalizado = req.file.originalname;
        var fileType = req.file.mimetype;
        var errorH;
        await fs.mkdir(dir, {recursive: true}).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        await fs.rename('./Files/uploads/'+expedienteDigitalizado, dir + expedienteDigitalizado).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        const buffer = await fs.readFile(dir + expedienteDigitalizado);
        if(!buffer)
            return res.json({ok: false, message: 'No existe el archivo'});
        var last = resp.prodep.length-1;
        resp.prodep[last].expediente_digitalizado.archivo = buffer;
        resp.prodep[last].expediente_digitalizado.extension_archivo = fileType;
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

  module.exports.actualizarExpediente = async(req, res)=>{
    try {
      const resp = await Trabajador.findOne({codigo: req.params.codigo});
      var laboral = resp.laboral.contratos_academicos[resp.laboral.contratos_academicos.length - 1];
      if(resp.status === "activo" && laboral.temporalidad === "tiempo completo"){
        var dir = './Files/uploads/'+req.params.codigo+'/expediente/';
        var expedienteDigitalizado = req.file.originalname;
        var errorH;
        await fs.rename('./Files/uploads/'+expedienteDigitalizado, dir + expedienteDigitalizado).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        const buffer = await fs.readFile(dir + expedienteDigitalizado);
        if(!buffer)
            return res.json({ok: false, message: 'No existe el archivo'});
        const resp = await Trabajador.findOne({codigo: req.params.codigo});
        var last = resp.prodep.length-1;
        resp.prodep[last].expediente_digitalizado.archivo = buffer;
        resp.prodep[last].expediente_digitalizado.extension_archivo = fileType;
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

  module.exports.descargarExpediente = async(req, res)=>{
    try {
        var codigo = req.params.codigo;
        var dir = './Files/temp/'+codigo+'.pdf';
        const WK = await Trabajador.findOne({codigo: codigo});
        var last = WK.prodep.length-1;
        const buffer = WK.prodep[last].expediente_digitalizado.archivo;
        var errorH;
        await fs.writeFile(dir, buffer).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        res.download(dir, 'Expediente'+codigo+'.pdf', function(err){
            fs.unlink(dir);
        });
    } catch (error) {
        res.json({ok: false, error});
    }
  }

  module.exports.verExpediente = async(req, res)=>{
    try {
        const resp = await Trabajador.findOne({codigo: req.params.codigo});
        var last = resp.prodep.length - 1;
        const exp = resp.prodep[last].expediente_digitalizado;
        res.json({ok: true, exp});
    } catch (error) {
        res.json({ok: false, error});
    }
  }
