import express from 'express'
const router = express.Router()
import {
	loginConDni,
	obtenerPerfilUsuario,
	resetPassword,
} from '../controllers/authController.js'
import { protegerRuta } from '../middlewares/authMiddleware.js'

/**
 * @fileoverview Define las rutas de autenticación de usuarios.
 * Este archivo maneja las peticiones de login, permitiendo a los usuarios (pacientes, doctores, administradores)
 * obtener un token JWT tras una autenticación exitosa con su DNI y contraseña.
 * También incluye una ruta para que los usuarios autenticados puedan obtener su propio perfil.
 *
 * @path /api/auth
 */

// Ruta de login principal con DNI y contraseña
router.post('/login', loginConDni) // <-- Ruta unificada para login con DNI

// Ruta para obtener el perfil del usuario autenticado
router.get('/perfil', protegerRuta, obtenerPerfilUsuario)

// Ruta para resetear la contraseña del usuario un usuario
router.post('/reset-password', resetPassword)

export default router
