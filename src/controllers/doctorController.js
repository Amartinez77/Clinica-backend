//controller para doctor
import bcrypt from 'bcryptjs'
import { getModels } from '../config/sequelize.js'
import { Op } from 'sequelize'

//registrar un nuevo doctor
export const registrarDoctor = async (req, res) => {
	try {
		const { dni, email, password, nombre, apellido, matricula, especialidad, precioConsulta, telefono } = req.body

		console.log('[Doctor DEBUG] registrarDoctor -> body recibido =', {
			dni,
			email,
			nombre,
			apellido,
			matricula,
			especialidad,
			precioConsulta,
			telefono,
			tipoEspecialidad: typeof especialidad,
		})

		// Verificar si el doctor ya existe por email o DNI
		const { Doctor, Especialidad } = getModels()
		const doctorExistente = await Doctor.findOne({ where: { [Op.or]: [{ email }, { dni }] } })
		if (doctorExistente) {
			return res.status(400).json({ message: 'El doctor ya está registrado con ese email o DNI' })
		}

		// Verificar si la matrícula ya existe
		const matriculaExistente = await Doctor.findOne({ where: { matricula } })
		if (matriculaExistente) {
			return res.status(400).json({ message: 'La matrícula ya está registrada' })
		}

		// Verificar si la especialidad existe
		console.log('[Doctor DEBUG] Buscando Especialidad.findByPk(', especialidad, ')')
		const especialidadExistente = await Especialidad.findByPk(especialidad)
		console.log('[Doctor DEBUG] Resultado Especialidad =', especialidadExistente ? { id: especialidadExistente.id, nombre: especialidadExistente.nombre } : null)
		if (!especialidadExistente) {
			return res.status(400).json({ message: 'La especialidad no existe' })
		}

		// Encriptar la contraseña
		const salt = await bcrypt.genSalt(10)
		const passwordEncriptada = await bcrypt.hash(password, salt)

		// Crear el nuevo doctor
		const nuevoDoctor = await Doctor.create({
			dni,
			email,
			password: passwordEncriptada,
			nombre,
			apellido,
			matricula,
			especialidadId: especialidad,
			precioConsulta,
			telefono,
			activo: true, // Establecer como activo por defecto
		})

		console.log('[Doctor DEBUG] Doctor creado OK ->', { id: nuevoDoctor.id, nombre: nuevoDoctor.nombre, especialidadId: nuevoDoctor.especialidadId })
		res.status(201).json({ message: 'Doctor registrado exitosamente', doctorId: nuevoDoctor.id })
	} catch (error) {
		console.error('Error al registrar doctor:', error.message)
		console.error('[Doctor DEBUG] Stack:', error.stack)
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

// Obtener todos los doctores
export const getDoctores = async (req, res) => {
	try {
		// se usa .select('-password') para no enviar la contraseña al cliente
		// se usa .populate('especialidad', 'nombre') para obtener el nombre de la especialidad
		const { Doctor, Especialidad } = getModels()
		
		if (!Doctor || !Especialidad) {
			return res.status(200).json([])
		}
		
		const doctores = await Doctor.findAll({ 
			attributes: { exclude: ['password'] }, 
			include: [{ model: Especialidad, attributes: ['nombre'], required: false }] 
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
		const { Doctor } = getModels()
		const doctorExistente = await Doctor.findByPk(id)
		if (!doctorExistente) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		// Si se está actualizando el email, verificar que no esté duplicado
		if (email && email !== doctorExistente.email) {
			const emailDuplicado = await Doctor.findOne({ where: { email, id: { [Op.ne]: id } } })
			if (emailDuplicado) {
				return res.status(400).json({ message: 'El email ya está en uso por otro doctor' })
			}
		}

		// Actualizar los datos del doctor (solo campos email, telefono, precioConsulta y disponibilidad)
		doctorExistente.email = email || doctorExistente.email
		doctorExistente.disponibilidad = disponibilidad || doctorExistente.disponibilidad
		doctorExistente.precioConsulta = precioConsulta || doctorExistente.precioConsulta
		doctorExistente.telefono = telefono || doctorExistente.telefono

		// Si se intenta cambiar la especialidad, verificar que la nueva especialidad exista (funciona pero me parece que no es necesario)
		/* if (especialidadId !== undefined) {
			const especialidadExistente = await Especialidad.findById(especialidad);
			if (!especialidadExistente) {
				return res.status(400).json({ message: 'La especialidad no existe' });
			}
			doctorExistente.especialidad = especialidad; // Actualizar la especialidad
		} */

		// Guardar los cambios en la base de datos
		await doctorExistente.save()

		res.status(200).json({ message: 'Doctor actualizado exitosamente', doctor: doctorExistente })
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
		const { Doctor, Especialidad } = getModels()
		const doctores = await Doctor.findAll({
			where: { nombre: { [Op.iLike]: `%${nombre}%` }, activo: true },
			attributes: { exclude: ['password'] },
			include: [{ model: Especialidad, attributes: ['nombre'] }],
		})

		if (doctores.length === 0) {
			return res.status(200).json(doctores, { message: 'No se encontraron doctores con ese nombre' })
		}

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
		const { Especialidad } = getModels()
		const especialidadEncontrada = await Especialidad.findByPk(idEspecialidad)

		if (!especialidadEncontrada) {
			return res.status(404).json({ message: 'No se encontró la especialidad' })
		}

		// Buscar doctores por el ID de la especialidad
		const { Doctor } = getModels()
		const doctores = await Doctor.findAll({ where: { especialidadId: especialidadEncontrada.id, activo: true }, attributes: { exclude: ['password'] }, include: [{ model: Especialidad, attributes: ['nombre'] }] })

		if (doctores.length === 0) {
			return res.status(200).json({ doctores: [], message: 'No se encontraron doctores con esa especialidad' })
		}

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
		const { Doctor, Especialidad } = getModels()
		const doctor = await Doctor.findByPk(id, { attributes: { exclude: ['password'] }, include: [{ model: Especialidad, attributes: ['nombre'] }] })

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		res.status(200).json(doctor)
	} catch (error) {
		console.error('Error al obtener el doctor por ID:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}
