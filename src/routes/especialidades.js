// src/routes/especialidades.js
import express from 'express'
const router = express.Router()
import {
	crearEspecialidad,
	getEspecialidadById,
	getEspecialidades,
	actualizarEspecialidad,
	eliminarEspecialidad,
} from '../controllers/especialidadController.js'
import { body } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'
import { autorizarRoles, protegerRuta } from '../middlewares/authMiddleware.js'

//  Rutas para manejar especialidades
router.post(
	'/',
	body('nombre').isString().withMessage('El nombre es obligatorio'),
	handleInputErrors,
	protegerRuta,
	autorizarRoles(['admin']),
	crearEspecialidad
)
router.get('/:id', getEspecialidadById)
router.get('/', getEspecialidades)
router.put('/:id', actualizarEspecialidad)
router.delete('/:id', eliminarEspecialidad)

// faltan agregar validaciones y middlewares de autorización si es necesario
// hay que definir si el admin solamente puede crear, actualizar y eliminar especialidades
// o si los doctores también pueden crear especialidades (por ejemplo, para agregar una nueva especialidad que no estaba en la base de datos al momento de crear el doctor)

export default router
