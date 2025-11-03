import Pago from '../models/Pago.js'

export const createPago = async (req, res) => {
	try {
		const { monto, metodoPago, turno } = req.body

		// Validar que el turno existe y es válido
		if (!turno) {
			return res.status(400).json({ error: 'El ID del turno es requerido' })
		}

		// Crear el nuevo pago
		const nuevoPago = new Pago({
			monto,
			metodoPago,
			turno,
			estado: 'pendiente', // Estado inicial del pago
		})

		await nuevoPago.save()

		res.status(201).json(nuevoPago)
	} catch (error) {
		console.error('Error al crear el pago:', error)
		res.status(500).json({ error: 'Error interno del servidor al crear el pago' })
	}
}
