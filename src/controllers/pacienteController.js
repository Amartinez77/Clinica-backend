// controlador para manejar un paciente
import bcrypt from 'bcryptjs'
import { getModels } from '../config/sequelize.js'
import { Op } from 'sequelize'

// funciones
export const registrarPaciente = async (req, res) => {
	try {
		console.log('[REGISTRO PACIENTE] Solicitud recibida:', req.body)
		// aca cambiamos para que el paciente se registre con dni y contraseña
		// y no con email y contraseña como en el modelo base Usuario
		const { dni, password, nombre, apellido, telefono, fechaNacimiento, email } = req.body
		console.log('[REGISTRO PACIENTE] Datos extraídos:', { dni, password, nombre, apellido, telefono, fechaNacimiento, email })

		// Validación de campos obligatorios
		// Esto podemos hacerlo con un middleware de express-validator
		// if (!email || !password || !nombre || !apellido || !telefono) {
		//   return res.status(400).json({ error: 'Todos los campos son obligatorios' });
		// }

		// 1- hay que verificar si el dni ya existe (ese es el identificador ahora, antes era el email)

		// valido que el paciente no este registrado por dni
		const { Paciente } = getModels()
		let paciente = await Paciente.findOne({ where: { dni } })
		if (paciente) {
			return res.status(400).json({ error: 'El DNI ya está registrado' })
		}

		// Si se proporciona un email, verificar que no esté ya registrado
		if (email && email.trim() !== '') {
			const pacienteConEmail = await Paciente.findOne({ where: { email: email.trim() } })
			if (pacienteConEmail) {
				return res.status(400).json({ error: 'El email ya está registrado' })
			}
		}

		// Encriptar la contraseña
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		// Normalizar el email: convertir string vacío a null para que funcione con sparse index
		const emailNormalizado = email && email.trim() !== '' ? email.trim() : null

		// Crear nuevo paciente
		const nuevoPaciente = await Paciente.create({
			dni,
			password: hashedPassword,
			nombre,
			apellido,
			telefono,
			fechaNacimiento,
			email: emailNormalizado, //opcional, pero si se proporciona, debe ser válido
		})

		console.log('Paciente registrado exitosamente:', nuevoPaciente.toJSON())
		res.status(201).json({ message: 'Paciente registrado exitosamente', paciente: nuevoPaciente })
	} catch (error) {
		console.error('[REGISTRO PACIENTE] Error al registrar paciente:', error.message)
		console.error('[REGISTRO PACIENTE] Stack trace:', error.stack)
		if (error.name === 'ValidationError') {
			let errors = {}
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message
			})
			return res.status(400).json({ error: 'Error de validación', details: errors })
		}
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}

export const getPacientes = async (req, res) => {
	try {
		const { Paciente } = getModels()
		const pacientes = await Paciente.findAll({ attributes: { exclude: ['password'] } })
		res.status(200).json(pacientes)
	} catch (error) {
		console.error('Error al obtener pacientes:', error.message)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}
export const getPacienteById = async (req, res) => {
	try {
		const { idPaciente } = req.params
		const { Paciente } = getModels()
		const paciente = await Paciente.findByPk(idPaciente, { attributes: { exclude: ['password'] } })
		if (!paciente) {
			return res.status(404).json({ error: 'Paciente no encontrado' })
		}
		res.status(200).json(paciente)
	} catch (error) {
		console.error('Error al obtener paciente:', error.message)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}
export const getPacienteByDni = async (req, res) => {
	try {
		const { dni } = req.params

		// Limpiar y normalizar el DNI
		const dniNormalizado = dni.trim()

		const { Paciente } = getModels()
		const paciente = await Paciente.findOne({ where: { dni: dniNormalizado }, attributes: { exclude: ['password'] } })

		if (!paciente) {
			// Para depuración: verificar qué DNI se está buscando
			console.log(`Buscando paciente con DNI: "${dniNormalizado}"`)
			return res.status(404).json({
				error: 'Paciente no encontrado',
				dniBuscado: dniNormalizado, // Para ayudar en la depuración
			})
		}

		res.status(200).json(paciente)
	} catch (error) {
		console.error('Error al obtener paciente por DNI:', error.message)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}
export const updatePaciente = async (req, res) => {
	const { idPaciente } = req.params
	const { telefono, email } = req.body

	try {
		// Validar que el paciente exista
		const { Paciente } = getModels()
		const paciente = await Paciente.findByPk(idPaciente)
		if (!paciente) {
			return res.status(404).json({ error: 'Paciente no encontrado' })
		}

		// Actualizar los campos del paciente
		paciente.telefono = telefono
		// Si se proporciona un email, verificar que no esté ya registrado
		console.log('Email recibido:', email, 'Paciente email:', paciente.email)
		if (email != paciente.email) {
			if (email && email.trim() !== '') {
				const pacienteConEmail = await Paciente.findOne({ email: email.trim() })
				if (pacienteConEmail) {
					return res.status(400).json({ error: 'El email ya está registrado' })
				}
				paciente.email = email.trim() // Normalizar el email
			}
		}


		await paciente.save()
		res.status(200).json({ message: 'Paciente actualizado exitosamente', paciente })
	} catch (error) {
		console.error('Error al actualizar paciente:', error.message)
		res.status(500).json({ error: 'Error interno del servidor' })
	}

}
export const desvincularGoogle = async (req, res) => {
	const { idPaciente } = req.params

	try {
		// Validar que el paciente exista
		const { Paciente } = getModels()
		const paciente = await Paciente.findByPk(idPaciente)
		if (!paciente) {
			return res.status(404).json({ error: 'Paciente no encontrado' })
		}

		// Desvincular Google eliminando el email
		paciente.uid_firebase = null
		await paciente.save()

		res.status(200).json({ message: 'Cuenta de Google desvinculada exitosamente', paciente })
	} catch (error) {
		console.error('Error al desvincular cuenta de Google:', error.message)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}