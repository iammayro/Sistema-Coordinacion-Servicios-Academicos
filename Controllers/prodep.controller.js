const Trabajador = require('../Models/trabajador.model');

module.exports.crearProdep = async (req, res) => {
  try {
    const prod = {
      fecha_recibido: req.body.fecha,
      duracion_anios: req.body.duracion,
      monto_economico: req.body.monto
    };
    const worker = await Trabajador.findOne({ codigo: req.params.codigo });
    for (let i = 0; i < worker.prodep.length; i++) {
      const fi = worker.prodep[i].fecha_recibido;
      const inicio = new Date(fi);
      const today = new Date();
      const year = inicio.getFullYear() + worker.prodep[i].duracion_anios;
      const month = inicio.getMonth() + 1;
      const day = inicio.getDate();
      const fin = new Date(`${year}-${month}-${day}`);
      if (today < fin)
        return res.json({
          ok: false,
          message: 'Existe un perfil vigente de prodep'
        });
    }
    const pr = await Trabajador.findOneAndUpdate(
      { codigo: req.params.codigo },
      { $push: { prodep: prod } }
    );
    const prodep = pr.prodep[pr.prodep.length - 1];
    return res.json({ ok: true, prodep });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

module.exports.actualizarProdep = async (req, res) => {
  try {
    const query = { codigo: req.params.codigo };
    const worker = await Trabajador.findOne(query);
    const last = worker.prodep[worker.prodep.length - 1];
    const fi = last.fecha_recibido;
    const inicio = new Date(fi);
    const today = new Date();
    const year = inicio.getFullYear() + last.duracion_anios;
    const month = inicio.getMonth() + 1;
    const day = inicio.getDate() + 15;
    const fin = new Date(`${year}-${month}-${day}`);
    if (today > fin)
      return res.json({ ok: false, message: 'perfil prodep no esta vigente' });
    const resp = await Trabajador.findOneAndUpdate(
      query,
      {
        prodep: [
          {
            fecha_recibido: req.body.fecha,
            duracion_anios: req.body.duracion,
            monto_economico: req.body.monto
          }
        ]
      },
      // removido segundo parametro no usado: prod
      function(err) {
        if (err)
          return res.json({ ok: false, err, message: 'Error al actualizar' });
      }
    );
    const { prodep } = resp;
    return res.json({ ok: true, prodep });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

module.exports.verProdep = async (req, res) => {
  try {
    const query = { codigo: req.params.codigo };
    const worker = await Trabajador.findOne(query);
    const { prodep } = worker;
    res.json({ ok: true, prodep });
  } catch (error) {
    res.json({ ok: false, error });
  }
};
