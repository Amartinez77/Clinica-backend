import mongoose from 'mongoose'

const turnoSchema = new mongoose.Schema({
	fecha: {
		type: String, // String debe ser dia/mes/año - 1/1/2025 o 21/10/2025
		trim: true,
		required: [true, 'La fecha del turno es obligatoria'],
		
	},
	hora: {
		type: String,
		required: [true, 'La hora del turno es obligatoria'],
	},
	paciente: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Paciente',
		required: [true, 'El paciente es obligatorio'],
	},
	doctor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Doctor',
		required: [true, 'El doctor es obligatorio'],
	},
	estado: {
		type: String,
		enum: ['pendiente','confirmado', 'realizado', 'cancelado'],
		default: 'pendiente',
	},
	observaciones: {
		type: String,
		trim: true,
		default: '',
	},
	archivos: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Archivo',
		},
	],
	expireAt:{
		type: Date,
		default: Date.now,
		expires: 86400, // 24 horas en segundos (24 * 60 * 60)
	},
})
const Turno = mongoose.model('Turno', turnoSchema)
export default Turno
