import express from 'express'
const router = express.Router()
import {
	registrarDoctor,
	getDoctores,
	actualizarDoctor,
	eliminarDoctor,
	getDoctoresByName,
	getDoctoresByEspecialidad,
	getDoctorById,
} from '../controllers/doctorController.js'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'
import { autorizarRoles, protegerRuta } from '../middlewares/authMiddleware.js'

// rutas
router.post(
	'/',
	body('dni').notEmpty().withMessage('El DNI es obligatorio'),
	body('email').isEmail().withMessage('El email debe ser válido'),
	body('password').notEmpty().withMessage('La contraseña es obligatoria'),
	body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
	body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
	body('matricula').notEmpty().withMessage('La matrícula es obligatoria'),
	body('especialidad').notEmpty().withMessage('La especialidad es obligatoria'),
	body('precioConsulta').isNumeric().withMessage('El precio de la consulta debe ser un número'),
	body('telefono').optional().isString().withMessage('El teléfono debe ser una cadena de texto'),
	handleInputErrors,
	protegerRuta,
	autorizarRoles(['admin']),
	registrarDoctor
)

// Registrar un nuevo doctor
router.get('/', getDoctores) // Obtener todos los doctores

// Actualizar un doctor por ID
router.put(
	'/:id',
	param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
	body('email').optional().isEmail().withMessage('El email debe ser válido'),
	body('telefono').optional().isString().withMessage('El teléfono debe ser una cadena de texto'),
	body('precioConsulta').optional().isNumeric().withMessage('El precio de la consulta debe ser un número'),
	handleInputErrors,
	protegerRuta,
	autorizarRoles(['admin', 'Doctor']),
	actualizarDoctor
)

// Eliminar un doctor por ID (borrado lógico)
router.delete(
	'/:id',
	param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
	handleInputErrors,
	protegerRuta,
	autorizarRoles(['admin']),
	eliminarDoctor
)

router.get('/name', getDoctoresByName)
router.get('/especialidad/:idEspecialidad', getDoctoresByEspecialidad)
router.get('/:id', getDoctorById)

export default router
