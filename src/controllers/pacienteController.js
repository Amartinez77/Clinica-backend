// controlador para manejar un paciente
import bcrypt from 'bcryptjs'
import { getModels } from '../config/sequelize.js'
import { Op } from 'sequelize'

// funciones
export const registrarPaciente = async (req, res) => {
	try {
		console.log('[REGISTRO PACIENTE] Solicitud recibida:', req.body)
		const { dni, password, nombre, apellido, telefono, fechaNacimiento, email } = req.body
		console.log('[REGISTRO PACIENTE] Datos extraídos:', { dni, password, nombre, apellido, telefono, fechaNacimiento, email })

		// Validación de campos obligatorios
		if (!dni || !password || !nombre || !apellido || !telefono || !fechaNacimiento) {
			return res.status(400).json({ error: 'DNI, contraseña, nombre, apellido, teléfono y fecha de nacimiento son obligatorios' })
		}

		const { Usuario, Paciente } = getModels()

		// 1. Verificar que el DNI no esté registrado en la tabla Usuario
		console.log('[REGISTRO PACIENTE] Verificando si DNI ya existe:', dni)
		let usuarioExistente = await Usuario.findOne({ where: { dni } })
		if (usuarioExistente) {
			console.log('[REGISTRO PACIENTE] DNI ya existe:', dni)
			return res.status(400).json({ error: 'El DNI ya está registrado' })
		}

		// 2. Si se proporciona un email, verificar que no esté registrado en Usuario
		let emailNormalizado = null
		if (email && email.trim() !== '') {
			emailNormalizado = email.trim()
			console.log('[REGISTRO PACIENTE] Verificando si email ya existe:', emailNormalizado)
			const usuarioConEmail = await Usuario.findOne({ where: { email: emailNormalizado } })
			if (usuarioConEmail) {
				console.log('[REGISTRO PACIENTE] Email ya existe:', emailNormalizado)
				return res.status(400).json({ error: 'El email ya está registrado' })
			}
		}

		// 3. Encriptar la contraseña
		console.log('[REGISTRO PACIENTE] Encriptando contraseña...')
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		// 4. Crear usuario primero
		console.log('[REGISTRO PACIENTE] Creando usuario...')
		const nuevoUsuario = await Usuario.create({
			dni,
			email: emailNormalizado,
			password: hashedPassword,
			nombre,
			apellido,
			tipo: 'paciente',
			rol: 'paciente',
		})
		console.log('[REGISTRO PACIENTE] Usuario creado:', nuevoUsuario.toJSON())

		// 5. Crear registro de paciente con el usuario_id
		console.log('[REGISTRO PACIENTE] Creando paciente con usuario_id:', nuevoUsuario.id)
		const nuevoPaciente = await Paciente.create({
			usuario_id: nuevoUsuario.id,
			telefono,
			fechaNacimiento,
		})
		console.log('[REGISTRO PACIENTE] Paciente registrado exitosamente:', nuevoPaciente.toJSON())

		res.status(201).json({ 
			message: 'Paciente registrado exitosamente', 
			paciente: nuevoPaciente,
			usuario: nuevoUsuario 
		})
	} catch (error) {
		console.error('[REGISTRO PACIENTE] Error al registrar paciente:', error.message)
		console.error('[REGISTRO PACIENTE] Full error:', error)
		if (error.name === 'ValidationError') {
			let errors = {}
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message
			})
			return res.status(400).json({ error: 'Error de validación', details: errors })
		}
		res.status(500).json({ error: 'Error interno del servidor', details: error.message })
	}
}

export const getPacientes = async (req, res) => {
	try {
		const { Paciente, Usuario } = getModels()
		
		// Get pagination parameters from query
		const pagina = parseInt(req.query.pagina) || 1
		const limite = parseInt(req.query.limite) || 10
		const offset = (pagina - 1) * limite
		
		// Get pacientes with pagination
		const { count, rows } = await Paciente.findAndCountAll({
			include: [{ 
				model: Usuario, 
				attributes: { exclude: ['password'] } 
			}],
			attributes: { exclude: ['password'] },
			limit: limite,
			offset: offset,
			order: [['createdAt', 'DESC']]
		})
		
		res.status(200).json({
			data: rows,
			total: count,
			pagina: pagina,
			limite: limite,
			totalPaginas: Math.ceil(count / limite)
		})
	} catch (error) {
		console.error('Error al obtener pacientes:', error.message)
		res.status(500).json({ error: 'Error interno del servidor' })
	}
}
export const getPacienteById = async (req, res) => {
	try {
		const { idPaciente } = req.params
		const { Paciente, Usuario } = getModels()
		const paciente = await Paciente.findByPk(idPaciente, { 
			include: [{ 
				model: Usuario, 
				attributes: { exclude: ['password'] } 
			}],
			attributes: { exclude: ['password'] } 
		})
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

		const { Paciente, Usuario } = getModels()
		// DNI is in Usuario table, so we need to search through the relationship
		const paciente = await Paciente.findOne({ 
			include: [{ 
				model: Usuario, 
				where: { dni: dniNormalizado },
				attributes: { exclude: ['password'] } 
			}],
			attributes: { exclude: ['password'] } 
		})

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