import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema(
  {
    dni: {
      type: String,
      required: [true, 'El DNI es obligatorio'],
      unique: true,
      trim: true,
      minlength: [7, 'El DNI debe tener al menos 7 caracteres'],
      maxlength: [8, 'El DNI no puede tener más de 8 caracteres'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true, // El email también debería ser único si lo vamos a usar con firebase + gmail
      sparse: true, // Permite que haya documentos con email nulo sin violar unique
      match: [/^\S+@\S+\.\S+$/, 'Por favor, introduce un email válido'], // Validación de formato de email
    },
    password: {
      type: String,
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    apellido: {
      type: String,
      trim: true,
    },
  },
  {
    discriminatorKey: '_rol',
    timestamps: true,
  }
)

const Usuario = mongoose.model('Usuario', usuarioSchema)
export default Usuario
