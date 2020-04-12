const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const TrabajadorSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'Por favor proporciona un codigo'],
    unique: true
  },
  nip: {
    type: String,
    required: [true, 'Por favor ingresa un nip'],
    select: false
  },
  tipo: {
    type: String,
    enum: ['maestro', 'coordinador de personal', 'jefe de departamento'],
    default: 'maestro'
  },
  status: {
    type: String,
    enum: ['activo', 'jubilado', 'finado', 'despedido', 'renuncia'],
    default: 'activo'
  },
  direccion_nacimiento: {
    ciudad: { type: String },
    estado: { type: String },
    pais: { type: String }
  },
  direccion_actual: {
    telefono: { type: String },
    ciudad: { type: String },
    estado: { type: String },
    pais: { type: String },
    calle: { type: String },
    colonia: { type: String },
    codigo_postal: { type: String },
    certificado_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    }
  },
  oficina: {
    telefono: { type: String },
    extension: { type: String }
  },
  personal: {
    nombres: { type: String },
    apellido_paterno: { type: String },
    apellido_materno: { type: String },
    correo: {
      type: String,
      // this only works on CREATE and SAVE!!!
      validate: [validator.isEmail, 'Por favor ingresa un correo valido']
    },
    telefono: { type: String },
    genero: {
      type: String,
      enum: ['H', 'M'],
      default: 'H'
    },
    estado_civil: { type: String },
    fecha_nacimiento: { type: Date },
    curp: { type: String },
    imss: { type: String },
    rfc: { type: String },
    foto_perfil: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    curp_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    imss_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    acta_nacimiento_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    rfc_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    ficha_unica_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    identificacion_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    }
  },
  laboral: {
    puesto: { type: String },
    correo: {
      type: String,
      // this only works on CREATE and SAVE!!!
      validate: [validator.isEmail, 'Por favor ingresa un correo valido']
    },
    nombramiento: { type: String },
    nombramiento_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    curriculum_digitalizado: {
      archivo: { type: Buffer },
      extension_archivo: { type: String }
    },
    dependencia_adscripcion: { type: mongoose.ObjectId },
    dependencia_adscripcion_academica: { type: mongoose.ObjectId },
    dependencia_adscripcion_fisica: { type: mongoose.ObjectId },
    contratos_administrativos: [
      {
        nombre: { type: String },
        contrato_digitalizado: {
          archivo: { type: Buffer },
          extension_archivo: { type: String }
        },
        temporalidad: { type: String },
        fecha_inicio: { type: String },
        fecha_fin: { type: String },
        turno: { type: String },
        carga_horaria: { type: Number },
        adscripcion: { type: mongoose.ObjectId },
        status: {
          type: String,
          enum: ['activo', 'no activo']
        }
      }
    ],
    contratos_academicos: [
      {
        nombre: { type: String },
        contrato_digitalizado: {
          archivo: { type: Buffer },
          extension_archivo: { type: String }
        },
        temporalidad: { type: String },
        fecha_inicio: { type: String },
        fecha_fin: { type: String },
        turno: { type: String },
        carga_horaria: { type: Number },
        adscripcion: { type: mongoose.ObjectId },
        status: { type: String }
      }
    ]
  },
  notificaciones: [
    {
      mensaje: { type: String },
      fecha_envio: { type: String },
      visto: { type: Boolean }
    }
  ],
  datos_academicos: [
    {
      titulo: { type: String },
      titulo_digitalizado: {
        archivo: { type: Buffer },
        extension_archivo: { type: String }
      },
      fecha_inicio: { type: String },
      fecha_fin: { type: String },
      universidad: { type: String },
      grado: { type: String }
    }
  ],
  curriculum: {
    idiomas: [
      {
        idioma: { type: String },
        habla: { type: Number },
        comprension: { type: Number },
        lectura: { type: Number },
        escritura: { type: Number }
      }
    ],
    programas: [
      {
        programa: { type: String },
        uso: { type: Number }
      }
    ],
    posiciones_trabajo: [
      {
        posicion: { type: String },
        institucion: { type: String },
        fecha_inicio: { type: String },
        fecha_fin: { type: String }
      }
    ],
    fichas_bibliograficas: [
      {
        ficha: { type: String }
      }
    ],
    materias_impartidas: [
      {
        materia: { type: String },
        numero_seccion: { type: Number },
        fecha_inicio: { type: String },
        fecha_fin: { type: String }
      }
    ],
    asociaciones_profesionales: [
      {
        asociacion: { type: String },
        tipo_membresia: { type: String },
        fecha_inicio: { type: String },
        fecha_fin: { type: String }
      }
    ],
    experiencias_profesionales: [
      {
        posicion: { type: String },
        compania: { type: String },
        fecha_inicio: { type: String },
        fecha_fin: { type: String }
      }
    ],
    premios: [
      {
        premio: { type: String },
        fecha: { type: String }
      }
    ],
    logros: [
      {
        logo: { type: String },
        fecha: { type: String }
      }
    ],
    productos: {
      libros: { type: Number },
      notas_de_clase: { type: Number },
      material_didactico: { type: Number },
      manual_de_practicas: { type: Number },
      articulos: { type: Number },
      memorias_del_congreso: { type: Number },
      patentes: { type: Number },
      articulos_de_divulgacion: { type: Number },
      participacion_en_foros: { type: Number },
      servicios_a_la_industria: { type: Number },
      convenios_con_la_industria: { type: Number }
    }
  },
  planes: {
    plan_trabajo: [
      {
        calendario: { type: String },
        fecha: { type: String },
        programa: { type: String },
        materia: { type: String },
        formacion_docente: { type: String },
        actividades_de_apoyo: { type: String },
        numero_de_grupos: { type: Number },
        nombre_de_linea: { type: String },
        nombre_proyecto: { type: String },
        progreso_anual: { type: Number },
        progreso_anual_esperado: { type: Number },
        descripcion_de_actividades: { type: String },
        tutoria_estudiantil: { type: String },
        ayuda_estudiantil: { type: String },
        formacion_estudiantil: { type: String },
        participacion: { type: String },
        gestion_academica: { type: String },
        gestion_colectiva: { type: String },
        conocimiento_colectivo: { type: String },
        gestion_personal: { type: String },
        difusion: { type: String },
        formacion: { type: String },
        comentarios_adicionales: { type: String },
        docencia_horas: { type: Number },
        lgac_horas: { type: Number },
        asesorias_horas: { type: Number },
        tutorias_horas: { type: Number },
        gestion_horas: { type: Number },
        difusion_horas: { type: Number },
        formacion_posgrado_horas: { type: Number },
        estado: {
          type: String,
          enum: ['aprobado', 'no aprobado', 'en espera'],
          default: 'en espera'
        },
        historial: [
          {
            por: { type: String },
            fecha: { type: String },
            comentario: { type: String },
            estado: {
              type: String,
              enum: ['aprobado', 'no aprobado', 'en espera'],
              default: 'en espera'
            }
          }
        ]
      }
    ],
    informe: [
      // Que que se hizo en el año
      {
        calendario: { type: String },
        fecha: { type: String },
        programa: { type: String },
        materia: { type: String },
        formacion_docente: { type: String },
        actividades_de_apoyo: { type: String },
        numero_de_grupos: { type: Number },
        nombre_de_linea: { type: String },
        nombre_proyecto: { type: String },
        progreso_del_ano: { type: Number },
        progreso_del_ano_esperdo: { type: Number },
        descripcion_de_actividades: { type: String },
        tutoria_estudiantil: { type: String },
        ayuda_estudiantil: { type: String },
        formacion_estudiantil: { type: String },
        participacion: { type: String },
        gestion_academica: { type: String },
        gestion_colectiva: { type: String },
        conocimiento_colectivo: { type: String },
        gestion_personal: { type: String },
        difusion: { type: String },
        formacion: { type: String },
        comentarios_adicionales: { type: String },
        docencia_horas: { type: Number },
        lgac_horas: { type: Number },
        asesorias_horas: { type: Number },
        tutorias_horas: { type: Number },
        gestion_horas: { type: Number },
        difusion_horas: { type: Number },
        formacion_posgrado_horas: { type: Number },
        estado: {
          type: String,
          enum: ['aprobado', 'no aprobado', 'en espera'],
          default: 'en espera'
        },
        historial: [
          {
            por: { type: String },
            fecha: { type: String },
            comentario: { type: String },
            estado: {
              type: String,
              enum: ['aprobado', 'no aprobado', 'en espera'],
              default: 'en espera'
            }
          }
        ]
      }
    ]
  },
  cursos: [
    {
      curso: { type: mongoose.ObjectId },
      fecha_terminado: { type: String },
      acreditado: { type: Boolean },
      constancia_digitalizada: {
        archivo: { type: Buffer },
        extension_archivo: { type: String }
      }
    }
  ],
  prodep: [
    {
      fecha_recibido: { type: String },
      duracion_anios: { type: Number },
      dictamen_digitalizado: {
        archivo: { type: Buffer },
        extension_archivo: { type: String }
      },
      expediente_digitalizado: {
        archivo: { type: Buffer },
        extension_archivo: { type: String }
      },
      monto_economico: { type: Number }
    }
  ],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

// Middleware de mongoose para ver si se modifico el usuario en el campo del nip
TrabajadorSchema.pre('save', function(next) {
  if (!this.isModified('nip') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000; // fecha actual menos un segundo
  next();
});

// Encriptar nip
TrabajadorSchema.pre('save', async function(next) {
  // Si el nip no fue modificado entonces no hacer nada, si no encriptar
  if (!this.isModified('nip')) {
    return next();
  }
  this.nip = await bcrypt.hash(this.nip, 12);
  next();
});

TrabajadorSchema.methods.compararNip = async function(nip, nipDBEncriptado) {
  return await bcrypt.compare(nip, nipDBEncriptado);
};

TrabajadorSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

TrabajadorSchema.methods.crearTokenRestauracion = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // el nuevo token expirara en 10 minutos
  this.passwordResetExpires = Date.now() + 10 * 60 * 100;
  return resetToken;
};

module.exports = mongoose.model('trabajadores', TrabajadorSchema);
