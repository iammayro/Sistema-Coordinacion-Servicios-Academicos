const CuerpoAcademico = require('../Models/CA.model');

module.exports.postCuerpoAcademicoIntegrante = async (req, res) => {
    try {
        //Esta variable solo se utiliza para probar el schema, se debe realizar una query a trabajadores para obtener el objeto del trabajador a agregar
        var integrante = {integrante: req.body.codigo, tipo: req.body.tipo};
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
            return res.json({ok: false, message: 'No se encuentra el documento en la bd'});
        CA.integrantes.push(integrante);
        const resp = CA.save();
        res.json({ok: true, resp});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.deleteCuerpoAcademicoIntegrante = async (req, res) => {
    try {
        var idIntegrante = req.params.codigo;
        const CA = await CuerpoAcademico.findOne({clave: req.params.id});
        if(!CA)
            return res.json({ok: false, message: 'No se encuentra el documento en la bd'});
        CA.integrantes.remove(idIntegrante);
        const resp = CA.save();
        res.json({ok: true, resp});
        
    } catch (error) {
        res.json({ok: false, error});
    }
}