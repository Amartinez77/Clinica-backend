import mongoose from 'mongoose'

const archivoSchema = new mongoose.Schema({
  tipo: { type: String, required: true, enum: ['medico', 'pago'] },
  url: { type: String, required: true },
  nombre: { type: String, required: true },
  fechaSubida: { type: Date, default: Date.now },
})

const Archivo = mongoose.model('Archivo', archivoSchema)
export default Archivo
