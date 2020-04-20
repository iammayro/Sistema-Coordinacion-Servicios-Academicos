const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const TrabajadorSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'Por favor proporciona un codigo'],
    unique: [true, 'Este codigo no es valido']
  },
  nip: {
    type: String,
    required: [true, 'Por favor ingresa un nip'],
    select: false
  },
  tipo: {
    type: String,
    enum: {
      values: ['maestro', 'coordinador de personal', 'jefe de departamento'],
      message:
        'Los valores validos para tipo son: maestro, coordinador de personal, jefe de departamento'
    },
    default: 'maestro'
  },
  status: {
    type: String,
    enum: {
      values: ['activo', 'jubilado', 'finado', 'despedido', 'renuncia'],
      message:
        'Los valores validos para status son: activo, jubilado, finado, despedido, renuncia'
    },
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
      enum: {
        values: ['H', 'M'],
        message: 'Los valores validos para genero son: H, M'
      },
      default: 'H'
    },
    estado_civil: { type: String },
    fecha_nacimiento: { type: Date },
    curp: { type: String },
    imss: { type: String },
    rfc: { type: String },
    foto_perfil: {
      type: String,
      default: 'default.png'
    },
    curp_digitalizado: {
      type: String
    },
    imss_digitalizado: {
      type: String
    },
    acta_nacimiento_digitalizado: {
      type: String
    },
    rfc_digitalizado: {
      type: String
    },
    ficha_unica_digitalizado: {
      type: String
    },
    identificacion_digitalizado: {
      type: String
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
        idioma: {
          type: String,
          required: [true, 'Por favor ingresa un idioma']
        },
        habla: {
          type: Number,
          required: [true, 'Ingresa un valor de habla'],
          min: [0, 'No se admiten negativos'],
          max: [100, 'El maximo es 100']
        },
        comprension: {
          type: Number,
          required: [true, 'Ingresa un valor de comprension'],
          min: [0, 'No se admiten negativos'],
          max: [100, 'El maximo es 100']
        },
        lectura: {
          type: Number,
          required: [true, 'Ingresa un valor de lectura'],
          min: [0, 'No se admiten negativos'],
          max: [100, 'El maximo es 100']
        },
        escritura: {
          type: Number,
          required: [true, 'Ingresa un valor de escritura'],
          min: [0, 'No se admiten negativos'],
          max: [100, 'El maximo es 100']
        }
      }
    ],
    programas: [
      {
        programa: {
          type: String,
          required: [true, 'Por favor ingresa un programa']
        },
        uso: {
          type: Number,
          required: [true, 'Ingresa un valor de uso'],
          min: [0, 'No se admiten negativos'],
          max: [100, 'El maximo es 100']
        }
      }
    ],
    posiciones_trabajo: [
      {
        posicion: {
          type: String,
          required: [true, 'Por favor ingresa una posicion']
        },
        institucion: {
          type: String,
          required: [true, 'Por favor ingresa una institucion']
        },
        fecha_inicio: {
          type: Date,
          required: [true, 'Por favor ingresa una fecha de inicio']
        },
        fecha_fin: {
          type: Date,
          required: [true, 'Por favor ingresa una fecha de finalizacion']
        }
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
        premio: {
          type: String,
          required: [true, 'Por favor ingresa un premio']
        },
        fecha: {
          type: Date,
          required: [true, 'Por favor ingresa una fecha']
        }
      }
    ],
    logros: [
      {
        logro: {
          type: String,
          required: [true, 'Por favor ingresa un logro']
        },
        fecha: {
          type: Date,
          required: [true, 'Por favor ingresa una fecha']
        }
      }
    ],
    productos: {
      libros: {
        type: Number,
        required: [true, 'Ingresa cantidad de libros'],
        default: 0
      },
      notas_de_clase: {
        type: Number,
        required: [true, 'Ingresa cantidad de notas de clase'],
        default: 0
      },
      material_didactico: {
        type: Number,
        required: [true, 'Ingresa cantidad de material didactico'],
        default: 0
      },
      manual_de_practicas: {
        type: Number,
        required: [true, 'Ingresa cantidad de manual de practicas'],
        default: 0
      },
      articulos: {
        type: Number,
        required: [true, 'Ingresa cantidad de articulos'],
        default: 0
      },
      memorias_del_congreso: {
        type: Number,
        required: [true, 'Ingresa cantidad de memorias del congreso'],
        default: 0
      },
      patentes: {
        type: Number,
        required: [true, 'Ingresa cantidad de patentes'],
        default: 0
      },
      articulos_de_divulgacion: {
        type: Number,
        required: [true, 'Ingresa cantidad de articulos de divulgacion'],
        default: 0
      },
      participacion_en_foros: {
        type: Number,
        required: [true, 'Ingresa cantidad de participacion en foros'],
        default: 0
      },
      servicios_a_la_industria: {
        type: Number,
        required: [true, 'Ingresa cantidad de servicios a la industria'],
        default: 0
      },
      convenios_con_la_industria: {
        type: Number,
        required: [true, 'Ingresa cantidad de convenios con la industria'],
        default: 0
      }
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
