import mongoose from 'mongoose'

const pagoSchema = new mongoose.Schema({
	fecha: {
		type: Date,
		default: Date.now,
	},
	monto: {
		type: Number,
		required: true,
	},
	metodoPago: {
		type: String,
		enum: ['mercadopago', 'efectivo', 'transferencia'],
		required: true,
	},
	turno: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Turno',
		required: true,
	},
	estado: {
		type: String,
		enum: ['pendiente', 'completado', 'cancelado'],
		default: 'pendiente',
	},
	paymentIdMp: {
		type: String,
	}
})

const Pago = mongoose.model('Pago', pagoSchema)
export default Pago
