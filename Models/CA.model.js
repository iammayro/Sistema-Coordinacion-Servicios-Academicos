const mongoose = require('mongoose');
const schema = mongoose.Schema;

const CuerpoAcademicoSchema = new mongoose.Schema({
  clave: { type: String, require: true },
  anio_creacion: { type: String },
  duracion_anios: { type: Number },
  nivel: { type: String }, // en formcion | en consolidacion | consolidado
  nombre: { type: String },
  dictamen_digitalizado: [
    { 
      dictamen: {type: Buffer} 
    }
  ],
  expediente_digitalizado: { type: Buffer },
  integrantes: [
    {
      integrante: { type: schema.Types.ObjectId, ref: 'trabajadores' }, // Referencia a trabajador
      tipo: { type: String } // representante | integrante | colaborador
    }
  ]
});

module.exports = mongoose.model('Cuerpos_Academicos', CuerpoAcademicoSchema);
