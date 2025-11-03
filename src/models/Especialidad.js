// modelo para especialidad de un doctor
import mongoose from 'mongoose';

const EspecialidadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la especialidad es obligatorio'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
}, {
  timestamps: true
});

export default mongoose.model('Especialidad', EspecialidadSchema);