const CuerpoAcademico = require('../Models/CA.model');

module.exports.postCuerpoAcademico = async (req, res) => {
    try {
        const resp2 = await CuerpoAcademico.findOne({clave: req.body.clave});
        if(!resp2)
        {
            var clave = req.body.clave;
            var anio = req.body.anio_creacion;
            var duracion = req.body.duracion;
            var nivel = req.body.nivel;
            var nombre = req.body.nombre;
            var objCA = new CuerpoAcademico({clave: clave, anio_creacion: anio, duracion: duracion, nivel: nivel, nombre: nombre});
            const resp = await objCA.save();
            if(!resp)
                return res.json({ok: false, message: 'Error al guardar el documento'});
            res.json({ok: true, resp});
        }
        else
            return res.json({ok: false,  message: 'Ya existe el documento'});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.putCuerpoAcademico = async (req, res) => {
    try {
        var query = {clave: req.params.id};
        var clave = req.body.clave;
        var anio = req.body.anio_creacion;
        var duracion = req.body.duracion;
        var nivel = req.body.nivel;
        var nombre = req.body.nombre;
        const resp = await CuerpoAcademico.findOne(query);
        if(!resp)
            return res.json({ok: false, message: 'No se encuentra el documento en la bd'});
        resp.clave = clave;
        resp.anio = anio;
        resp.duracion = duracion;
        resp.nivel = nivel;
        resp.nombre = nombre;
        const CA = await resp.save();
        if(!CA)
            return res.json({ok: false, message: 'Error al guardar documento'});
        res.json({ok: true, CA});
    } catch (error) {
        res.json({ok: false, error});
    }
}


module.exports.getCuerposAcademicos = async (req, res) => {
    try {
        //Populate indica que se llenara los datos de integrantes con la referencia del trabajador
        const resp = await CuerpoAcademico.find();//.populate('integrantes.integrante');
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.getCuerpoAcademico = async (req, res) => {
    try {
        //Populate indica que se llenara los datos de integrantes con la referencia del trabajador
        var codigo = req.params.id;
        const resp = await CuerpoAcademico.findOne({clave: codigo});//.populate('integrantes.integrante');
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}