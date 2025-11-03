//controlador que maneja la autenticación de usuarios por DNI y contraseña para cualquier usuario
import { getModels } from '../config/sequelize.js'
import jwt from 'jsonwebtoken'
import jwtConfig from '../config/jwtConfig.js'
import bcrypt from 'bcryptjs'
import { body } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'
import firebaseApp from '../config/firebase.js'
import { getAuth } from 'firebase-admin/auth'

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
const generarJWT = (ID, rol) => {
	const normalized = normalizeRoleForFrontend(rol)
	const payload = {
		usuario: {
			id: ID,
			rol: normalized, // rol normalizado para el frontend
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
			const { dni, password } = req.body

			// Intentar buscar por DNI en Usuario, Paciente y Doctor (en ese orden)
			const { Usuario, Paciente, Doctor } = getModels() || {}

			let registro = null
			let rol = 'Usuario'

			if (Usuario) {
				registro = await Usuario.findOne({ where: { dni } })
			}
			if (!registro && Paciente) {
				registro = await Paciente.findOne({ where: { dni } })
				if (registro) rol = 'Paciente'
			}
			if (!registro && Doctor) {
				registro = await Doctor.findOne({ where: { dni } })
				if (registro) rol = 'Doctor'
			}

			console.log('DEBUG auth: buscado dni=', dni, '=> usuario encontrado=', registro ? registro.id : null)
			if (!registro) {
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			if (!registro.password) {
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			// comparar la contraseña hasheada
			const passwordValido = await bcrypt.compare(password, registro.password)
			console.log('DEBUG auth: comparar password para usuario', registro.id, '=> resultado=', passwordValido)
			if (!passwordValido) {
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			// Generar el token JWT con rol normalizado
			const token = generarJWT(registro.id, registro._rol || registro.rol || rol)
			res.status(200).json({ token })
		} catch (error) {
			console.error('Error al iniciar sesión:', error.message)
			res.status(500).json({ msg: 'Error interno del servidor' })
		}
	},
]

// obtener información del usuario autenticado
export const obtenerPerfilUsuario = async (req, res) => {
	try {
		// Asegurarnos de enviar un objeto plano y normalizar el rol para el frontend
		const usuario = req.usuario
		if (!usuario) return res.status(401).json({ msg: 'No autorizado' })
		// si es instancia de Sequelize, obtener objeto plano
		let plain = usuario.get ? usuario.get({ plain: true }) : { ...usuario }
		// Compatibilidad con frontend legacy: exponer _id además de id
		if (plain && plain.id && !plain._id) {
			plain._id = plain.id
		}
		// Normalizar rol esperado por el frontend
		plain._rol = normalizeRoleForFrontend(plain._rol || plain.rol)
		// Debug útil para verificar forma del objeto
		console.log('[AUTH DEBUG] /auth/me ->', {
			id: plain.id,
			_id: plain._id,
			rol: plain._rol,
			model: usuario?.constructor?.name,
		})
		res.json(plain)
	} catch (error) {
		console.error('Error al obtener el usuario autenticado:', error.message)
		res.status(500).json({ msg: 'Error interno del servidor' })
	}
}

export const loginConFirebase = async (req, res) => {
	try {
		const { idToken } = req.body

		// Verificamos el idToken con Firebase Admin
		const decodedToken = await getAuth().verifyIdToken(idToken)
		const { user_id, name, email } = decodedToken

		const { Paciente } = getModels()
		const paciente = await Paciente.findOne({ where: { uid_firebase: user_id } })
		if (paciente) {
			const token = generarJWT(paciente.id, paciente._rol || paciente.rol)
			return res.status(200).json({ token })
		}

		// Si no existe el paciente, pedimos dni en el frontend
		return res.status(200).json({
			dniConfirmado: false,
			email,
			user_id,
			name,
		})
	} catch (error) {
		console.error('Error al verificar el token de Firebase:', error.message)
		return res.status(401).json({ msg: 'Token inválido o expirado' })
	}
}

export const vincularDni = async (req, res) => {
	try {
		const { user_id, dni, email, name } = req.body

		// Primero verificar si el DNI existe en el modelo base Usuario
		const { Usuario, Paciente } = getModels()

		const usuarioExistente = await Usuario.findOne({ where: { dni } })

		if (usuarioExistente) {
			// Si existe, verificar si es un paciente
			const paciente = await Paciente.findOne({ where: { dni } })

			if (paciente) {
				// Es un paciente, vincular Firebase
				paciente.uid_firebase = user_id
				paciente.email = email
				await paciente.save()
				const token = generarJWT(paciente.id, paciente._rol || paciente.rol)
				return res.status(200).json({ token })
			} else {
				// Es un doctor o administrador
				return res.status(403).json({
					msg: 'Solo los pacientes pueden iniciar sesión con Google. Los doctores y administradores deben usar el login con DNI y contraseña.',
				})
			}
		}

		// Si no existe ningún usuario con ese DNI, crear un nuevo paciente
		const nuevoPaciente = await Paciente.create({
			dni,
			uid_firebase: user_id,
			email,
			nombre: name,
			apellido: null,
			password: null,
			telefono: null,
			fechaNacimiento: null,
		})

		const token = generarJWT(nuevoPaciente.id, nuevoPaciente._rol || nuevoPaciente.rol)
		res.status(201).json({ token })
	} catch (error) {
		console.error('Error al vincular el DNI:', error.message)
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
