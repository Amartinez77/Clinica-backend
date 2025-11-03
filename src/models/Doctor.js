// modelo para doctor
import mongoose from 'mongoose'
import Usuario from './Usuario.js'

const DoctorSchema = new mongoose.Schema({
  matricula: {
    type: String,
    required: [true, 'La matrícula es obligatoria'],
    unique: true,
    trim: true,
  },
  especialidad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Especialidad',
    // se refiere al modelo Especialidad
    required: [true, 'La especialidad es obligatoria'],
    //trim: true,
  },
  precioConsulta: {
    type: Number,
    required: [true, 'El precio de la consulta es obligatorio'],
    min: [0, 'El precio de la consulta no puede ser negativo'],
  },
  telefono: {
    type: String,
    trim: true,
    default: null,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  // la disponibilidad del doctor se gestiona en el frontend
  // de ahi guardamos la disponibilidad en el turno (Hora y Fecha)
  // y no en el doctor, sacaria disponibilidad de aqui
  // disponibilidad: [{
  //   diaSemana: {
  //     type: String,
  //     required: true,
  //     enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
  //   },
  //   horaInicio: {
  //     type: String, //usar string HH:MM
  //     required: true,
  //   },
  //   horaFin: {
  //     type: String, //usar string HH:MM
  //     required: true,
  //   }
  // }]
})

// Hereda del modelo Usuario
const Doctor = Usuario.discriminator('Doctor', DoctorSchema)
export default Doctor
