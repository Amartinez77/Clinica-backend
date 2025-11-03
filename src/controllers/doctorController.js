//controller para doctor
import Doctor from '../models/Doctor.js'
import Especialidad from '../models/Especialidad.js'
import bcrypt from 'bcryptjs'

//registrar un nuevo doctor
export const registrarDoctor = async (req, res) => {
	try {
		const { dni, email, password, nombre, apellido, matricula, especialidad, precioConsulta, telefono } = req.body

		// Verificar si el doctor ya existe por email o DNI
		const doctorExistente = await Doctor.findOne({
			$or: [{ email }, { dni }],
		})
		if (doctorExistente) {
			return res.status(400).json({ message: 'El doctor ya está registrado con ese email o DNI' })
		}

		// Verificar si la matrícula ya existe
		const matriculaExistente = await Doctor.findOne({ matricula })
		if (matriculaExistente) {
			return res.status(400).json({ message: 'La matrícula ya está registrada' })
		}

		// Verificar si la especialidad existe
		const especialidadExistente = await Especialidad.findById(especialidad)
		if (!especialidadExistente) {
			return res.status(400).json({ message: 'La especialidad no existe' })
		}

		// Encriptar la contraseña
		const salt = await bcrypt.genSalt(10)
		const passwordEncriptada = await bcrypt.hash(password, salt)

		// Crear el nuevo doctor
		const nuevoDoctor = new Doctor({
			dni,
			email,
			password: passwordEncriptada,
			nombre,
			apellido,
			matricula,
			especialidad, // se guarda la referencia al objectId de especialidad
			precioConsulta,
			telefono,
			activo: true, // Establecer como activo por defecto
		})

		// Guardar el doctor en la base de datos
		await nuevoDoctor.save()

		res.status(201).json({ message: 'Doctor registrado exitosamente', doctorId: nuevoDoctor._id })
	} catch (error) {
		console.error('Error al registrar doctor:', error.message)
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
		const doctores = await Doctor.find().select('-password').populate('especialidad', 'nombre')
		res.status(200).json(doctores)
	} catch (error) {
		console.error('Error al obtener doctores:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}

// actualizar informacion de un doctor (actualiza email, telefono, precioConsulta y disponibilidad)
export const actualizarDoctor = async (req, res) => {
	try {
		const { id } = req.params
		const { email, nombre, apellido, especialidad, precioConsulta, telefono, disponibilidad } = req.body

		// Verificar si el doctor existe
		const doctorExistente = await Doctor.findById(id)
		if (!doctorExistente) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		// Si se está actualizando el email, verificar que no esté duplicado
		if (email && email !== doctorExistente.email) {
			const emailDuplicado = await Doctor.findOne({ email, _id: { $ne: id } })
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

		// Verificar si el doctor existe
		const doctorExistente = await Doctor.findById(id)
		if (!doctorExistente) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}
		// Marcar al doctor como inactivo
		doctorExistente.activo = false
		await doctorExistente.save()
		res.status(200).json({ message: 'Doctor eliminado exitosamente' })
	} catch (error) {
		console.error('Error al eliminar el doctor:', error.message)
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
		const doctores = await Doctor.find({
			nombre: { $regex: nombre, $options: 'i' }, // 'i' para case-insensitive
			activo: true, // solo doctores activos
		})
			.select('-password')
			.populate('especialidad', 'nombre')

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
		const especialidadEncontrada = await Especialidad.findById(idEspecialidad)

		if (!especialidadEncontrada) {
			return res.status(404).json({ message: 'No se encontró la especialidad' })
		}

		// Buscar doctores por el ID de la especialidad
		const doctores = await Doctor.find({
			especialidad: especialidadEncontrada._id,
			activo: true, // solo doctores activos
		})
			.select('-password')
			.populate('especialidad', 'nombre')

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
		const doctor = await Doctor.findById(id).select('-password').populate('especialidad', 'nombre')

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor no encontrado' })
		}

		res.status(200).json(doctor)
	} catch (error) {
		console.error('Error al obtener el doctor por ID:', error.message)
		res.status(500).json({ message: 'Error interno del servidor' })
	}
}
