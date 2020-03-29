const CuerpoAcademico = require('../Models/CA.model');
const fsp = require('fs').promises;

module.exports.postCuerpoAcademicoExp = async (req, res) => {
    try {
        var dir = './Files/uploads/'+req.params.id+'/expediente/';
        var expedienteDigitalizado = req.file.originalname;
        var errorH;
        await fsp.mkdir(dir, {recursive: true}).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        await fsp.rename('./Files/uploads/'+expedienteDigitalizado, dir + expedienteDigitalizado).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        const buffer = await fsp.readFile(dir + expedienteDigitalizado);
        if(!buffer)
            return res.json({ok: false, message: 'No existe el archivo'});
        const resp = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!resp)
            return res.json({ok: false, message: 'No existe el documento en la bd'});
        resp.expediente_digitalizado = buffer;
        const CA = await resp.save();
        if(!CA)
            return res.json({ok: false, message: 'Error al guardar documento'});
        res.json({ok: true, CA});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.putCuerpoAcademicoExp = async (req, res) => {
    try {
        var dir = './Files/uploads/'+req.params.id+'/expediente/';
        var expedienteDigitalizado = req.file.originalname;
        var errorH;
        await fsp.rename('./Files/uploads/'+expedienteDigitalizado, dir + expedienteDigitalizado).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        const buffer = await fsp.readFile(dir + expedienteDigitalizado);
        if(!buffer)
            return res.json({ok: false, message: 'No existe el archivo'});
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
            return res.json({ok: false, message: 'No se encuentra el documento en la bd'});
        CA.expediente_digitalizado = buffer;
        const resp = await CA.save();
        if(!resp)
            return res.json({ok: false, message: 'Error al guardar el documento en la bd'});
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.getCuerpoAcademicoExp = async (req, res) => {
    try {
        var codigo = req.params.id;
        var dir = './Files/temp/'+codigo+'.pdf';
        const CA = await CuerpoAcademico.findOne({clave: codigo});
        const buffer = CA.expediente_digitalizado;
        var errorH;
        await fsp.writeFile(dir, buffer).catch(function errHandler(e){
            errorH = e;
        });
        if(errorH)
            return res.json({ok: false, errorH});
        res.download(dir, 'Expediente'+codigo+'.pdf', function(err){
            fsp.unlink(dir);
        });
    } catch (error) {
        res.json({ok: false, error});
    }
}