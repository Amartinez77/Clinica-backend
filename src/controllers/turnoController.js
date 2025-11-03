import Turno from '../models/Turno.js'
import Paciente from '../models/Paciente.js'
import Doctor from '../models/Doctor.js'

const createTurno = async (req, res) => {
	try {
		const { idPaciente, idDoctor } = req.params
		const { fecha, hora, observaciones } = req.body
		// Verificar si el paciente existe
		const paciente = await Paciente.findById(idPaciente)
		if (!paciente) {
			return res.status(404).json({ error: 'Paciente no encontrado' })
		}

		// Verificar si el doctor existe
		const doctor = await Doctor.findById(idDoctor)
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor no encontrado' })
		}

		// Crear el turno
		const turno = new Turno({
			paciente: idPaciente,
			doctor: idDoctor,
			fecha,
			hora,
			observaciones,
		})

		await turno.save()
		res.status(201).json(turno)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al crear el turno' })
	}
}
const getTurnosByPaciente = async (req, res) => {
	try {
		const { idPaciente } = req.params
		const turnos = await Turno.find({ paciente: idPaciente })
			.populate({
				path: 'doctor',
				populate: {
					path: 'especialidad',
				},
			})
			.populate('paciente')
		turnos.reverse()
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos' })
	}
}
const getTurnosByDoctor = async (req, res) => {
	try {
		const { idDoctor } = req.params
		const turnos = await Turno.find({ doctor: idDoctor })
			.populate('paciente')
			.populate({
				path: 'doctor',
				populate: {
					path: 'especialidad',
				},
			})
			.populate('archivos')
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos' })
	}
}
const getTurnoById = async (req, res) => {
	try {
		const { idTurno } = req.params
		const turno = await Turno.findById(idTurno).populate('paciente').populate('doctor').populate('archivos')
		if (!turno) {
			return res.status(404).json({ error: 'Turno no encontrado' })
		}
		res.json(turno)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener el turno' })
	}
}
const cancelarTurno = async (req, res) => {
	try {
		const { idTurno } = req.params
		const turno = await Turno.findById(idTurno)
		if (!turno) {
			return res.status(404).json({ error: 'Turno no encontrado' })
		}

		// Verificar si el turno ya está cancelado
		if (turno.cancelado) {
			return res.status(400).json({ error: 'El turno ya está cancelado' })
		} else {
			// Marcar el turno como cancelado
			turno.estado = 'cancelado'
			await turno.save()
		}
		res.json({ message: 'Turno cancelado exitosamente' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al cancelar el turno' })
	}
}
const updateTurno = async (req, res) => {
	try {
		const { idTurno } = req.params
		const { observaciones } = req.body

		const turno = await Turno.findById(idTurno)
		if (!turno) {
			return res.status(404).json({ error: 'Turno no encontrado' })
		}

		// Actualizar los campos del turno
		turno.observaciones = observaciones || turno.observaciones

		await turno.save()
		res.json(turno)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al actualizar el turno' })
	}
}
const successTurno = async (req, res) => {
	try {
		const { idTurno } = req.params
		const turno = await Turno.findById(idTurno)
		if (!turno) {
			return res.status(404).json({ error: 'Turno no encontrado' })
		}

		// Marcar el turno como exitoso
		turno.estado = 'realizado'
		await turno.save()
		res.json({ message: 'Turno marcado como exitoso' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al marcar el turno como exitoso' })
	}
}

const getTurnosByDoctorAndFecha = async (req, res) => {
	try {
		const { idDoctor } = req.params
		const { fecha } = req.query
		const turnos = await Turno.find({
			doctor: idDoctor,
			fecha,
			estado: {
				$in: ['pendiente', 'confirmado'],
			},
		})
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos por fecha' })
	}
}

const getAllTurnos = async (req, res) => {
	try {
		const turnos = await Turno.find().populate('paciente').populate('doctor')
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos' })
	}
}

const getTurnosByFecha = async (req, res) => {
	try {
		const { fecha } = req.query // Asegúrate que estás usando req.query
		console.log('Fecha recibida:', fecha, typeof fecha) // Para depuración
		if (!fecha) {
			return res.status(400).json({ error: 'La fecha es requerida' })
		}
		console.log('Fecha recibida:', fecha, typeof fecha) // Para depuración
		// Busca directamente por el campo fecha (asegúrate que existe en tu schema)
		const turnos = await Turno.find({ fecha: fecha.toString() })
			.populate('paciente', '-password')
			.populate('doctor', '-password')

		res.json(turnos)
	} catch (error) {
		console.error('Error:', error)
		res.status(500).json({ error: 'Error al buscar turnos por fecha' })
	}
}

const getTurnosPendientes = async (req, res) => {
	try {
		const turnos = await Turno.find({ estado: 'pendiente' })
			.populate('paciente')
			.populate('doctor')
			.populate('archivos')
		
		turnos.reverse()
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos pendientes' })
	}
}
const confirmarTurno = async (req, res) => {
	try {
		const { idTurno } = req.params
		const turno = await Turno.findById(idTurno)
		if (!turno) {
			return res.status(404).json({ error: 'Turno no encontrado' })
		}

		// Marcar el turno como confirmado
		turno.estado = 'confirmado'
		turno.expireAt = null // Eliminar la expiración del turno
		await turno.save()
		res.json({ message: 'Turno confirmado exitosamente' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al confirmar el turno' })
	}
}
const getTurnosByEstadoAndPacienteId = async (req,res) => {
	
		try {
			const { idPaciente,estado } = req.params
			const turnos = await Turno.find({ paciente: idPaciente, estado })
				.populate('paciente')
				.populate({
				path: 'doctor',
				populate: {
					path: 'especialidad',
				},
			})
			res.json(turnos)
		} catch (error) {
			console.error(error)
			res.status(500).json({ error: `Error al obtener los turnos con estado ${estado}` })
		}
}
export default {
	createTurno,
	getTurnosByPaciente,
	getTurnosByDoctor,
	getTurnoById,
	cancelarTurno,
	updateTurno,
	successTurno,
	getTurnosByDoctorAndFecha,
	getAllTurnos,
	getTurnosByFecha,
	getTurnosPendientes,
	getTurnosByEstadoAndPacienteId,
	confirmarTurno,
}
