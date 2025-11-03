// modelo para paciente (legacy Mongoose)
import mongoose from 'mongoose'
import Usuario from './Usuario.js'

const PacienteSchema = new mongoose.Schema({
  telefono: {
    type: String,
    trim: true,
  },
  fechaNacimiento: {
    type: String, // Usar string en formato YYYY-MM-DD
    trim: true,
  },
  uid_firebase: {
    type: String,
    trim: true,
    default: null,
  },
})

// Hereda del modelo Usuario
const Paciente = Usuario.discriminator('Paciente', PacienteSchema)
export default Paciente
