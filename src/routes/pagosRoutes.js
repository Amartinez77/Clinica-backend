import express from 'express'
import { createPago } from '../controllers/pagoController.js'
import { body } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'

const router = express.Router()

router.post(
	'/',
	body('monto').notEmpty().isNumeric().withMessage('El monto debe ser un número'),
	body('metodoPago')
		.notEmpty()
		.isIn(['mercadopago', 'efectivo', 'transferencia'])
		.withMessage('Método de pago inválido'),
	body('turno').notEmpty().isMongoId().withMessage('El ID del turno es inválido'),
	handleInputErrors,
	createPago
)

// aqui ruta para cambiar el estado del pago

export default router
