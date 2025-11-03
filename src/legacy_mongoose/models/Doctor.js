// modelo para doctor (legacy Mongoose)
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
    required: [true, 'La especialidad es obligatoria'],
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
})

// Hereda del modelo Usuario
const Doctor = Usuario.discriminator('Doctor', DoctorSchema)
export default Doctor
