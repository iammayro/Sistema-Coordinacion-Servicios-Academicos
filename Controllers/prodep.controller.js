const Trabajador = require('../Models/trabajador.model');

module.exports.crearProdep = async (req, res) => {
    try {
      var prod = {fecha_recibido: req.body.fecha, duracion_anios: req.body.duracion, monto_economico: req.body.monto};
      const worker = await Trabajador.findOne({codigo: req.params.codigo});
      for(let i = 0; i < worker.prodep.length; i++){
        var fi = worker.prodep[i].fecha_recibido;
        var inicio = new Date(fi);
        var today = new Date();
        var year = inicio.getFullYear() + worker.prodep[i].duracion_anios;
        var month = inicio.getMonth()+1;
        var day = inicio.getDate();
        var fin = new Date(year + '-' + month + '-' + day);
        if(today < fin) return res.json({ok: false, message: 'Existe un perfil vigente de prodep'});
      }
      const pr = await Trabajador.findOneAndUpdate({codigo: req.params.codigo},{$push: {prodep: prod}});
      const prodep = pr.prodep[pr.prodep.length - 1];
      return res.json({ok: true, prodep});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.actualizarProdep = async (req, res) => {
    try {
      var query = {codigo: req.params.codigo};
      const worker = await Trabajador.findOne(query);
      var last = worker.prodep[worker.prodep.length - 1];
      var fi = last.fecha_recibido;
      var inicio = new Date(fi);
      var today = new Date();
      var year = inicio.getFullYear() + last.duracion_anios;
      var month = inicio.getMonth()+1;
      var day = inicio.getDate()+15;
      var fin = new Date(year + '-' + month + '-' + day);
      if(today > fin) return res.json({ok: false, message: 'perfil prodep no esta vigente'});
      const resp = await Trabajador.findOneAndUpdate(query, { prodep: [{fecha_recibido: req.body.fecha, duracion_anios: req.body.duracion, monto_economico: req.body.monto}]}, function(err, prod){
          if(err)
              return res.json({ok: false, err, message: 'Error al actualizar'});
      });
        const prodep = resp.prodep;
        return res.json({ok: true, prodep});
    } catch (error) {
        res.json({ok: false, error});
    }
}

module.exports.verProdep = async (req, res) => {
  try{
    var query = {codigo: req.params.codigo};
    const worker = await Trabajador.findOne(query);
    const prodep = worker.prodep;
    res.json({ok: true, prodep});
  }catch(error){
    res.json({ok: false, error});
  }
}
