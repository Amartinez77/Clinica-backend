//controller para doctor
import bcrypt from 'bcryptjs'
import { getModels } from '../config/sequelize.js'
import { Op } from 'sequelize'

//registrar un nuevo doctor
export const registrarDoctor = async (req, res) => {
	try {
		const { dni, email, password, nombre, apellido, matricula, especialidadId, precioConsulta, telefono } = req.body

		console.log('[Doctor DEBUG] registrarDoctor -> body recibido =', {
			dni,
			email,
			nombre,
			apellido,
			matricula,
			especialidadId,
			precioConsulta,
			telefono,
		})

		// Obtener modelos
		const { Doctor, Usuario, Especialidad } = getModels()

		// Verificar si el usuario ya existe por email o DNI
		const usuarioExistente = await Usuario.findOne({ where: { [Op.or]: [{ email }, { dni }] } })
		if (usuarioExistente) {
			return res.status(400).json({ msg: 'El usuario ya está registrado con ese email o DNI' })
		}

		// Verificar si la matrícula ya existe
		const matriculaExistente = await Doctor.findOne({ where: { matricula } })
		if (matriculaExistente) {
			return res.status(400).json({ msg: 'La matrícula ya está registrada' })
		}

		// Verificar si la especialidad existe
		const especialidadExistente = await Especialidad.findByPk(especialidadId)
		if (!especialidadExistente) {
			return res.status(400).json({ msg: 'La especialidad no existe' })
		}

		// Encriptar la contraseña
		const salt = await bcrypt.genSalt(10)
		const passwordEncriptada = await bcrypt.hash(password, salt)

		// 1. Crear el Usuario primero
		const nuevoUsuario = await Usuario.create({
			dni,
			email,
			password: passwordEncriptada,
			nombre,
			apellido,
			tipo: 'doctor',
			rol: 'doctor',
		})

		console.log('[Doctor DEBUG] Usuario creado OK ->', { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre })

		// 2. Crear el Doctor referenciando el usuario
		const nuevoDoctor = await Doctor.create({
			usuario_id: nuevoUsuario.id,
			especialidadId,
			matricula,
			precioConsulta,
			telefono,
			estado: 'activo',
		})

		console.log('[Doctor DEBUG] Doctor creado OK ->', { id: nuevoDoctor.id, usuario_id: nuevoDoctor.usuario_id })
		res.status(201).json({ message: 'Doctor registrado exitosamente', doctorId: nuevoDoctor.id })
	} catch (error) {
		console.error('Error al registrar doctor:', error.message)
		console.error('[Doctor DEBUG] Stack:', error.stack)
		if (error.name === 'ValidationError') {
			let errors = {}
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message
			})
			return res.status(400).json({ msg: error.message })
		}
		res.status(500).json({ msg: 'Error interno del servidor' })
	}
}

// Obtener todos los doctores
export const getDoctores = async (req, res) => {
	try {
		// se usa .select('-password') para no enviar la contraseña al cliente
		// se usa .populate('especialidad', 'nombre') para obtener el nombre de la especialidad
		const { Doctor, Especialidad, Usuario } = getModels()
		
		if (!Doctor || !Especialidad || !Usuario) {
			return res.status(200).json([])
		}
		
		const doctores = await Doctor.findAll({ 
			attributes: { exclude: ['password'] }, 
			include: [
				{ model: Usuario, attributes: { exclude: ['password'] }, required: false },
				{ model: Especialidad, attributes: ['id', 'nombre'], required: false }
			] 
		})
		res.status(200).json(doctores || [])
	} catch (error) {
		console.error('Error al obtener doctores:', error.message)
		res.status(200).json([])
	}
}

// actualizar informacion de un doctor (actualiza email, telefono, precioConsulta y disponibilidad)
export const actualizarDoctor = async (req, res) => {
	try {
		const { id } = req.params
		const { email, nombre, apellido, especialidad, precioConsulta, telefono, disponibilidad } = req.body

		// Verificar si el doctor existe
		const { Doctor, Usuario } = getModels()
		const doctorExistente = await Doctor.findByPk(id, { 
			include: [{ model: Usuario, attributes: { exclude: ['password'] } }]
		})
		if (!doctorExistente) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		// Si se está actualizando el email, verificar que no esté duplicado
		if (email && email !== doctorExistente.Usuario.email) {
			const emailDuplicado = await Usuario.findOne({ where: { email, id: { [Op.ne]: doctorExistente.usuario_id } } })
			if (emailDuplicado) {
				return res.status(400).json({ message: 'El email ya está en uso' })
			}
		}

		// Actualizar los datos del usuario (nombre, apellido, email)
		if (email) doctorExistente.Usuario.email = email
		if (nombre) doctorExistente.Usuario.nombre = nombre
		if (apellido) doctorExistente.Usuario.apellido = apellido
		
		// Actualizar los datos del doctor (telefono, precioConsulta y disponibilidad)
		if (telefono) doctorExistente.telefono = telefono
		if (precioConsulta) doctorExistente.precioConsulta = precioConsulta
		if (disponibilidad) doctorExistente.disponibilidad = disponibilidad

		// Guardar los cambios en la base de datos
		await doctorExistente.Usuario.save()
		await doctorExistente.save()

		// Devolver el doctor actualizado con el usuario
		const { Especialidad } = getModels()
		const doctorActualizado = await Doctor.findByPk(id, {
			include: [
				{ model: Usuario, attributes: { exclude: ['password'] } },
				{ model: Especialidad, attributes: ['id', 'nombre'] }
			]
		})

		res.status(200).json({ message: 'Doctor actualizado exitosamente', doctor: doctorActualizado })
	} catch (error) {
		console.error('Error al actualizar el doctor:', error.message)
		if (error.name === 'ValidationError') {
			let errors = {}
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message
			})
			return res.status(400).json({ message: error.message })
		}
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}

// Eliminar un doctor (borrado lógico)
export const eliminarDoctor = async (req, res) => {
	try {
		const { id } = req.params
		console.log('[Doctor DEBUG] eliminarDoctor -> id param =', id)

		// Verificar si el doctor existe
		const { Doctor } = getModels()
		const doctorExistente = await Doctor.findByPk(id)
		console.log('[Doctor DEBUG] eliminarDoctor -> encontrado =', doctorExistente ? { id: doctorExistente.id, activo: doctorExistente.activo } : null)
		if (!doctorExistente) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}
		// Marcar al doctor como inactivo
		doctorExistente.activo = false
		await doctorExistente.save()
		console.log('[Doctor DEBUG] eliminarDoctor -> marcado inactivo OK')
		res.status(200).json({ message: 'Doctor eliminado exitosamente' })
	} catch (error) {
		console.error('Error al eliminar el doctor:', error.message)
		console.error('[Doctor DEBUG] Stack:', error.stack)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}
export const getDoctoresByName = async (req, res) => {
	try {
		const { nombre } = req.query

		if (!nombre) {
			return res.status(400).json({ message: 'Debe proporcionar un nombre para buscar' })
		}

		// Buscar doctores por nombre usando regex para búsqueda parcial (like)
		const { Doctor, Especialidad, Usuario } = getModels()
		const doctores = await Doctor.findAll({
			where: { estado: 'activo' },
			attributes: { exclude: ['password'] },
			include: [
				{ 
					model: Usuario, 
					where: {
						[Op.or]: [
							{ nombre: { [Op.iLike]: `%${nombre}%` } },
							{ apellido: { [Op.iLike]: `%${nombre}%` } }
						]
					},
					attributes: { exclude: ['password'] }
				},
				{ model: Especialidad, attributes: ['id', 'nombre'] }
			],
		})

		res.status(200).json(doctores)
	} catch (error) {
		console.error('Error al buscar doctores por nombre:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}
export const getDoctoresByEspecialidad = async (req, res) => {
	try {
		const { idEspecialidad } = req.params

		if (!idEspecialidad) {
			return res.status(400).json({ message: 'Debe proporcionar una especialidad para buscar' })
		}

		// Buscar primero la especialidad por ID
		const { Especialidad, Doctor, Usuario } = getModels()
		const especialidadEncontrada = await Especialidad.findByPk(idEspecialidad)

		if (!especialidadEncontrada) {
			return res.status(404).json({ message: 'No se encontró la especialidad' })
		}

		// Buscar doctores por el ID de la especialidad
		const doctores = await Doctor.findAll({ 
			where: { especialidadId: especialidadEncontrada.id, estado: 'activo' }, 
			attributes: { exclude: ['password'] }, 
			include: [
				{ model: Usuario, attributes: { exclude: ['password'] } },
				{ model: Especialidad, attributes: ['id', 'nombre'] }
			] 
		})

		res.status(200).json(doctores)
	} catch (error) {
		console.error('Error al buscar doctores por especialidad:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}
export const getDoctorById = async (req, res) => {
	try {
		const { id } = req.params

		// Buscar el doctor por ID
		const { Doctor, Especialidad, Usuario } = getModels()
		const doctor = await Doctor.findByPk(id, { 
			attributes: { exclude: ['password'] }, 
			include: [
				{ model: Usuario, attributes: { exclude: ['password'] } },
				{ model: Especialidad, attributes: ['id', 'nombre'] }
			] 
		})

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		res.status(200).json(doctor)
	} catch (error) {
		console.error('Error al obtener el doctor por ID:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}

// Cambiar el estado de un doctor (activo/inactivo)
export const cambiarEstadoDoctor = async (req, res) => {
	try {
		const { id } = req.params
		const { estado } = req.body

		console.log('[Doctor DEBUG] cambiarEstadoDoctor -> id:', id, 'estado:', estado)

		// Validar que el estado sea válido
		if (!estado || !['activo', 'inactivo'].includes(estado.toLowerCase())) {
			return res.status(400).json({ message: 'El estado debe ser "activo" o "inactivo"' })
		}

		// Verificar si el doctor existe
		const { Doctor } = getModels()
		const doctorExistente = await Doctor.findByPk(id)
		if (!doctorExistente) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		// Cambiar el estado
		const esActivo = estado.toLowerCase() === 'activo'
		doctorExistente.activo = esActivo
		await doctorExistente.save()

		console.log('[Doctor DEBUG] cambiarEstadoDoctor -> actualizado OK, activo:', doctorExistente.activo)
		res.status(200).json({ message: `Doctor marcado como ${estado}`, doctor: doctorExistente })
	} catch (error) {
		console.error('Error al cambiar el estado del doctor:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}
