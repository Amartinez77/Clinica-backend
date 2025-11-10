import { Router } from 'express'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'
import { subirArchivo, eliminarArchivo } from '../controllers/archivoController.js'

const router = Router()

router.post(
	'/:idTurno',
	param('idTurno').isMongoId().withMessage('El ID del turno debe ser un ObjectId válido'),
	body('tipo').isIn(['medico', 'pago']).withMessage('El tipo de archivo debe ser "medico" o "pago"'),
	body('url').notEmpty().withMessage('La URL del archivo es obligatoria'),
	handleInputErrors,
	subirArchivo
)

router.delete(
	'/:idArchivo',
	param('idArchivo').isMongoId().withMessage('El ID del archivo debe ser un ObjectId válido'),
	handleInputErrors,
	eliminarArchivo
)

export default router
