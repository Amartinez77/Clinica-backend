//controlador que maneja la autenticación de usuarios por DNI y contraseña para cualquier usuario
import { getModels } from '../config/sequelize.js'
import jwt from 'jsonwebtoken'
import jwtConfig from '../config/jwtConfig.js'
import bcrypt from 'bcryptjs'
import { body } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'

// Normalizar el nombre del rol para que coincida con lo que espera el frontend
const normalizeRoleForFrontend = (rawRole) => {
	if (!rawRole) return 'Paciente'
	const r = String(rawRole).toLowerCase()
	if (r.includes('admin')) return 'admin' // frontend acepta 'admin' o 'Administrador'
	if (r.includes('doctor') || r.includes('medico')) return 'Doctor'
	if (r.includes('pacient') || r === 'usuario' || r === 'user') return 'Paciente'
	// fallback: capitalizar primera letra
	return rawRole.charAt(0).toUpperCase() + rawRole.slice(1)
}

// funcion auxiliar para generar un token JWT
const generarJWT = (usuario) => {
	const payload = {
		usuario: {
			id: usuario.id,
			tipo: usuario.tipo,
		},
	}
	const secret = process.env.JWT_SECRET || jwtConfig.secret
	const expiresIn = jwtConfig.expiresIn || '1h'
	return jwt.sign(payload, secret, { expiresIn })
}

// validación de inputs para el login con dni y contraseña
export const loginConDni = [
	body('dni')
		.trim()
		.notEmpty()
		.withMessage('El DNI es obligatorio')
		.isString()
		.withMessage('El DNI debe ser una cadena de texto')
		.isLength({ min: 7, max: 8 })
		.withMessage('El DNI debe tener entre 7 y 8 caracteres'),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('La contraseña es obligatoria')
		.isString()
		.withMessage('La contraseña debe ser una cadena de texto')
		.isLength({ min: 6 })
		.withMessage('La contraseña debe tener al menos 6 caracteres'),
	handleInputErrors, // Middleware para manejar errores de validación (Muestra un arreglo de errores)

	async (req, res) => {
		try {
			const { dni, password, tipo } = req.body
			console.log('[LOGIN] Solicitud recibida:', { dni, tipo })

			const models = getModels()
			if (!models) {
				console.error('[LOGIN] Models no inicializados')
				return res.status(500).json({ msg: 'Error: Modelos no disponibles' })
			}
			const { Usuario } = models

			const usuario = await Usuario.findOne({ where: { dni, tipo } })
			console.log('[LOGIN] Usuario encontrado:', usuario ? 'SÍ' : 'NO')

			if (!usuario) {
				console.log('[LOGIN] DNI o tipo incorrecto - dni:', dni, 'tipo:', tipo)
				return res.status(401).json({ msg: 'Credenciales inválidas o tipo de usuario incorrecto' })
			}

			if (!usuario.password) {
				console.log('[LOGIN] Usuario sin contraseña hasheada')
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			// comparar la contraseña hasheada
			const passwordValido = await bcrypt.compare(password, usuario.password)
			console.log('[LOGIN] Validación de contraseña:', passwordValido ? 'VÁLIDA' : 'INVÁLIDA')
			if (!passwordValido) {
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			// Generar el token JWT
			const token = generarJWT(usuario)

			// Obtener el perfil completo
			const perfil = await obtenerPerfilCompleto(usuario.id, usuario.tipo)

			res.status(200).json({ token, user: perfil })
		} catch (error) {
			console.error('Error al iniciar sesión:', error.message)
			res.status(500).json({ msg: 'Error interno del servidor' })
		}
	},
]

// obtener información del usuario autenticado
export const obtenerPerfilUsuario = async (req, res) => {
	try {
		const usuario = req.usuario
		if (!usuario) return res.status(401).json({ msg: 'No autorizado' })

		const perfil = await obtenerPerfilCompleto(usuario.id, usuario.tipo)

		if (!perfil) {
			return res.status(404).json({ msg: 'Perfil no encontrado' })
		}

		res.json(perfil)
	} catch (error) {
		console.error('Error al obtener el usuario autenticado:', error.message)
		res.status(500).json({ msg: 'Error interno del servidor' })
	}
}

export const resetPassword = async (req, res) => {
	const { dni, newPassword } = req.body

	// Comprobar si existe el usuario
	const { Usuario } = getModels()
	const usuario = await Usuario.findOne({ where: { dni } })
	if (!usuario) {
		return res.status(404).json({ msg: 'Usuario no encontrado' })
	}

	// Encriptar la contraseña
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(newPassword, salt)
	usuario.password = hashedPassword
	await usuario.save()

	res.status(200).json({ msg: 'Contraseña restablecida con éxito' })
}

// --- Funciones auxiliares ---

async function obtenerPerfilCompleto(usuarioId, tipo) {
	try {
		const models = getModels()
		if (!models) {
			console.error('[PERFIL] Models no inicializados')
			throw new Error('Models no disponibles')
		}
		
		console.log('[PERFIL] Modelos disponibles:', Object.keys(models))
		const { Usuario, Paciente, Doctor } = models

		if (!Usuario) {
			console.error('[PERFIL] Modelo Usuario no disponible')
			throw new Error('Usuario model no disponible')
		}

		const usuarioBase = await Usuario.findByPk(usuarioId, {
			attributes: { exclude: ['password'] },
		})

		if (!usuarioBase) {
			console.log('[PERFIL] Usuario no encontrado:', usuarioId)
			return null
		}

		let perfilDetallado = null
		let perfilFinal = { ...usuarioBase.get({ plain: true }) }

		console.log('[PERFIL] Tipo de usuario:', tipo)

		if (tipo === 'paciente') {
			if (!Paciente) {
				console.warn('[PERFIL] Modelo Paciente no disponible')
				return perfilFinal
			}
			perfilDetallado = await Paciente.findOne({ where: { usuario_id: usuarioId } })
			if (perfilDetallado) {
				perfilFinal.Paciente = perfilDetallado.get({ plain: true })
			}
		} else if (tipo === 'doctor') {
			if (!Doctor) {
				console.warn('[PERFIL] Modelo Doctor no disponible')
				return perfilFinal
			}
			perfilDetallado = await Doctor.findOne({
				where: { usuario_id: usuarioId },
				include: ['Especialidad'],
			})
			if (perfilDetallado) {
				perfilFinal.Doctor = perfilDetallado.get({ plain: true })
			}
		}
		// Para 'admin', no hay tabla adicional - el perfil está en usuario

		console.log('[PERFIL] Perfil completado para usuarioId:', usuarioId)
		return perfilFinal
	} catch (error) {
		console.error('[PERFIL] Error:', error.message)
		throw error
	}
}
