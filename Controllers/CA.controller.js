const CuerpoAcademico = require('../Models/CA.model');

module.exports.postCuerpoAcademico = async (req, res) => {
  try {
    const resp2 = await CuerpoAcademico.findOne({ clave: req.body.clave });
    if (!resp2) {
      const { clave } = req.body;
      const anio = req.body.anio_creacion;
      const { duracion } = req.body;
      const { nivel } = req.body;
      const { nombre } = req.body;
      const objCA = new CuerpoAcademico({
        clave: clave,
        anio_creacion: anio,
        duracion: duracion,
        nivel: nivel,
        nombre: nombre
      });
      const resp = await objCA.save();
      if (!resp)
        return res.json({
          ok: false,
          message: 'Error al guardar el documento'
        });
      res.json({ ok: true, resp });
    } else return res.json({ ok: false, message: 'Ya existe el documento' });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

module.exports.putCuerpoAcademico = async (req, res) => {
  try {
    const query = { clave: req.params.id };
    const { clave } = req.body;
    const anio = req.body.anio_creacion;
    const { duracion } = req.body;
    const { nivel } = req.body;
    const { nombre } = req.body;
    const resp = await CuerpoAcademico.findOne(query);
    if (!resp)
      return res.json({
        ok: false,
        message: 'No se encuentra el documento en la bd'
      });
    resp.clave = clave;
    resp.anio = anio;
    resp.duracion = duracion;
    resp.nivel = nivel;
    resp.nombre = nombre;
    const CA = await resp.save();
    if (!CA)
      return res.json({ ok: false, message: 'Error al guardar documento' });
    res.json({ ok: true, CA });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

module.exports.getCuerposAcademicos = async (req, res) => {
  try {
    //Populate indica que se llenara los datos de integrantes con la referencia del trabajador
    const resp = await CuerpoAcademico.find(); //.populate('integrantes.integrante');
    res.json({ ok: true, resp });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

module.exports.getCuerpoAcademico = async (req, res) => {
  try {
    //Populate indica que se llenara los datos de integrantes con la referencia del trabajador
    const codigo = req.params.id;
    const resp = await CuerpoAcademico.findOne({ clave: codigo }); //.populate('integrantes.integrante');
    res.json({ ok: true, resp });
  } catch (error) {
    res.json({ ok: false, error });
  }
};
