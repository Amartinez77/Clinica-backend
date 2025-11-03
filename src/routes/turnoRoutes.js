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
	param('idPaciente').isMongoId().withMessage('ID de paciente inválido'),
	param('idDoctor').isMongoId().withMessage('ID de doctor inválido'),
	body('fecha').isString().withMessage('Fecha inválida'),
	body('hora').isString().withMessage('Hora inválida'),
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
