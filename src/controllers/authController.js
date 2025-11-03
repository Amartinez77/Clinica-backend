//controlador que maneja la autenticación de usuarios por DNI y contraseña para cualquier usuario
import { getModels } from '../config/sequelize.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { body } from 'express-validator'
import { handleInputErrors } from '../middlewares/validacionInputs.js'
import firebaseApp from '../config/firebase.js'

// funcion auxiliar para generar un token JWT
const generarJWT = (ID, rol) => {
	const payload = {
		usuario: {
			id: ID,
			rol: rol, // rol se toma del campo 'rol' del esquema base Usuario o de '_rol' de mongodb
		},
	}
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
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

			// Buscar al usuario por DNI en el modelo base Usuario
			const { Usuario } = getModels()
			const usuario = await Usuario.findOne({ where: { dni } })
			if (!usuario) {
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			// comparar la contraseña hasheada
			const passwordValido = await bcrypt.compare(password, usuario.password)
			if (!passwordValido) {
				return res.status(401).json({ msg: 'Credenciales inválidas' })
			}

			// Generar el token JWT
			const token = generarJWT(usuario.id, usuario._rol || usuario.rol) // Esto toma el rol del campo '_rol'
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
		res.json(req.usuario) // req.usuario se establece en el middleware de autenticación
	} catch (error) {
		console.error('Error al obtener el usuario autenticado:', error.message)
		res.status(500).json({ msg: 'Error interno del servidor' })
	}
}

export const loginConFirebase = async (req, res) => {
	try {
		const { idToken } = req.body

		const decodedToken = await firebaseApp.auth().verifyIdToken(idToken)
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
