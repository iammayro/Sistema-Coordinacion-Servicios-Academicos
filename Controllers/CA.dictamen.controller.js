const CuerpoAcademico = require('../Models/CA.model');
const fsp = require('fs').promises;

module.exports.postCuerpoAcademicoDic = async (req, res) => {
    try {
        var dir = './Files/uploads/' + req.params.id+'/dictamenes/';
        var dictamenDigitalizado = req.file.originalname;
        var errorH;
        await fsp.mkdir(dir, {recursive: true}).catch(function errHandler(e){
        	errorH = e;
        });
        if(errorH)
        	return res.json({ok: false, errorH});
        await fsp.rename('./Files/uploads/'+dictamenDigitalizado, dir + dictamenDigitalizado).catch(function errHandler(e){
        	errorH = e;
        });
        if(errorH)
        	return res.json({ok: false, errorH});
        const buffer = await fsp.readFile(dir + dictamenDigitalizado);
        if(!buffer)
        	return res.json({ok: false, message: 'No existe el archivo'});
        const resp = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!resp)
        	return res.json({ok: false, message: 'No existe el documento en la bd'});
        resp.dictamen_digitalizado = buffer;
        const CA = await resp.save();
        if(!CA)
        	return res.json({ok: false, message: 'Error al guardar documento'});
        res.json({ok: true, CA});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.putCuerpoAcademicoDic = async (req, res) => {
    try {
    	//Issue 1: solo guarda un dictamen a la vez, se debe modificar el schema para guardar multiples dictamenes
    	//Se deben guardar con una id que los identifique, al schema le falta una id
        var dir = './Files/uploads/' + req.params.id+'/dictamenes/';
        var dictamenDigitalizado = req.file.originalname;
        var errorH;
        await fsp.rename('./Files/uploads/'+dictamenDigitalizado, dir + dictamenDigitalizado).catch(function errHandler(e){
        	errorH = e;
        });
        if(errorH)
        	return res.json({ok: false, errorH});
        const buffer = await fsp.readFile(dir + dictamenDigitalizado);
        if(!buffer)
        	return res.json({ok: false, message: 'No existe el archivo'});
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
        	return res.json({ok: false, message: 'No se encuentra el documento en la bd'});
        CA.dictamen_digitalizado = buffer;
        const resp = await CA.save();
        if(!resp)
        	return res.json({ok: false, message: 'Error al guardar el documento en la bd'});
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.getCuerpoAcademicoDic = async (req, res) => {
    try {
    	//Issue 2: Debido al Issue 1, solo obtiene el ultimo dictamen guardado
    	//Se deben buscar con la id, al schema le falta una id
        var codigo = req.params.id;
        var dir = './Files/temp/'+codigo+'.pdf';
        const CA = await CuerpoAcademico.findOne({clave: codigo});
        const buffer = CA.dictamen_digitalizado;
        var errorH;
        await fsp.writeFile(dir, buffer).catch(function errHandler(e){
        	errorH = e;
        });
        if(errorH)
        	return res.json({ok: false, errorH});
        res.download(dir, 'Dictamen'+codigo+'.pdf', function(err){
            fsp.unlink(dir);
        });
        
    } catch (error) {
        res.json({ok: false, error});
    }
}