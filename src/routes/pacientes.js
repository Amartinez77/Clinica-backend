//rutas para el modelo paciente
import express from 'express'
const router = express.Router()
import { registrarPaciente, getPacientes, getPacienteById, getPacienteByDni, updatePaciente, desvincularGoogle } from '../controllers/pacienteController.js'
import { protegerRuta, autorizarRoles } from '../middlewares/authMiddleware.js'
import { body,param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'


// validaciones comunes para registrar CUALQUIER TIPO DE USUARIO (heredado de Usuario)
const registrarUsuarioValidaciones = [
	body('dni')
		.notEmpty()
		.withMessage('El DNI es obligatorio')
		.isString()
		.withMessage('El DNI debe ser una cadena de texto')
		.isLength({ min: 7, max: 8 })
		.withMessage('El DNI debe tener entre 7 y 8 caracteres')
		.trim(),
	body('password')
		.notEmpty()
		.withMessage('La contraseña es obligatoria')
		.isString()
		.withMessage('La contraseña debe ser una cadena de texto')
		.isLength({ min: 6 })
		.withMessage('La contraseña debe tener al menos 6 caracteres')
		.trim(),
	body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim(),
	body('apellido').notEmpty().withMessage('El apellido es obligatorio').trim(),
]

// validaciones específicas para registrar un paciente
const registrarPacienteValidaciones = [
	...registrarUsuarioValidaciones, // de esta forma "hereda" las validaciones comunes
	body('email')
		.optional({ values: 'falsy' }) // El email es opcional, pero si se proporciona, debe ser válido
		.isEmail()
		.withMessage('Por favor, introduce un email válido')
		.normalizeEmail(), // Normaliza el email para evitar problemas de mayúsculas/minúsculas
	// despues se agrega mas validaciones específicas para pacientes si es necesario
]

// Ruta para registrar un nuevo paciente
router.post(
	'/registro',
	body('dni')
		.notEmpty()
		.withMessage('El DNI es obligatorio')
		.isString()
		.withMessage('El DNI debe ser una cadena de texto')
		.isLength({ min: 7, max: 8 })
		.withMessage('El DNI debe tener entre 7 y 8 caracteres')
		.trim(),
	body('password')
		.notEmpty()
		.withMessage('La contraseña es obligatoria')
		.isString()
		.withMessage('La contraseña debe ser una cadena de texto')
		.isLength({ min: 6 })
		.withMessage('La contraseña debe tener al menos 6 caracteres')
		.trim(),
	body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim(),
	body('apellido').notEmpty().withMessage('El apellido es obligatorio').trim(),
	body('email')
		.optional({ values: 'falsy' }) // El email es opcional, pero si se proporciona, debe ser válido
		.isEmail()
		.withMessage('Por favor, introduce un email válido')
		.normalizeEmail(),
	handleInputErrors,
	registrarPaciente
)

// Ruta para obtener todos los pacientes
router.get('/', protegerRuta, autorizarRoles('admin'), getPacientes)

// estas rutas ya estan validadas con token JWT y protegidas por middlewares y funcionan

router.get('/dni/:dni', getPacienteByDni)
// faltan agregar las rutas para actualizar y eliminar pacientes
router.get('/:idPaciente', getPacienteById)

//actualizar paciente solo telefono y email
router.put('/:idPaciente',
	param('idPaciente').isMongoId().withMessage('El ID debe ser un ID de Mongo válido'),
	body('email').optional().isEmail().withMessage('El email debe ser válido'),
	body('telefono').isNumeric().withMessage('El teléfono debe ser una cadena de numeros'),
	handleInputErrors
	,updatePaciente)

router.put('/desvincular/:idPaciente',desvincularGoogle)
export default router
