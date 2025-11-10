import express from 'express'
import turnoController from '../controllers/turnoController.js'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'
import { autorizarRoles, protegerRuta } from '../middlewares/authMiddleware.js'

const router = express.Router()
// Rutas para Turnos

// Crear un turno
router.post(
	'/paciente/:idPaciente/doctor/:idDoctor',
	param('idPaciente').isInt().withMessage('ID de paciente debe ser un número'),
	param('idDoctor').isInt().withMessage('ID de doctor debe ser un número'),
	body('fechaHora')
		.isISO8601()
		.withMessage('Fecha y hora debe ser una fecha ISO 8601 válida'),
	body('observaciones')
		.optional()
		.isString()
		.withMessage('Observaciones debe ser un texto'),
	handleInputErrors,
	turnoController.createTurno
)

// Obtener turnos por paciente y doctor
router.get('/paciente/:idPaciente', turnoController.getTurnosByPaciente)
router.get('/doctor/:idDoctor', turnoController.getTurnosByDoctor)
// Obtener todos los turnos
router.get('/', turnoController.getAllTurnos)
// Obtener turnos fecha
router.get('/fecha', turnoController.getTurnosByFecha)
// Obtener un turno por ID
router.get('/:idTurno', turnoController.getTurnoById)

// Obtener todos los turnos de un doctor por fecha
router.get('/doctor/:idDoctor/fecha', turnoController.getTurnosByDoctorAndFecha)
// Obtener turnos por estado pendiente
router.get('/estado/pendiente', turnoController.getTurnosPendientes)
// Obtener turnos por estado :estado
router.get('/estado/:estado/paciente/:idPaciente',turnoController.getTurnosByEstadoAndPacienteId)
// Actualizar un turno (actualiza solo observaciones)
router.put('/:idTurno', turnoController.updateTurno)

// Cancelar un turno cambia estado a "cancelado"
router.put(
	'/:idTurno/cancelado',
	param('idTurno').isMongoId().withMessage('ID de turno inválido'),
	handleInputErrors,
	turnoController.cancelarTurno
)

// Marcar un turno como realizado cambia estado a "realizado"
router.put(
	'/:idTurno/realizado',
	param('idTurno').isMongoId().withMessage('ID de turno inválido'),
	handleInputErrors,
	protegerRuta,
	autorizarRoles('Doctor'),
	turnoController.successTurno
)
// Confirmar un turno cambia estado a "confirmado"
router.put(
	'/:idTurno/confirmado',
	param('idTurno').isMongoId().withMessage('ID de turno inválido'),
	handleInputErrors,
	protegerRuta,
	autorizarRoles('admin'),
	turnoController.confirmarTurno
)
export default router
