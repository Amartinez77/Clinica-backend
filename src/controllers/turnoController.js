import { getModels } from '../config/sequelize.js'
import { Op } from 'sequelize'

const createTurno = async (req, res) => {
	try {
		const { idPaciente, idDoctor } = req.params
		const { fecha, hora, observaciones } = req.body
		const { Paciente, Doctor, Turno } = getModels()
		// Verificar si el paciente existe
		const paciente = await Paciente.findByPk(idPaciente)
		if (!paciente) {
			return res.status(404).json({ error: 'Paciente no encontrado' })
		}

		// Verificar si el doctor existe
		const doctor = await Doctor.findByPk(idDoctor)
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor no encontrado' })
		}

		// Crear el turno
		const turno = await Turno.create({
			pacienteId: idPaciente,
			doctorId: idDoctor,
			fecha,
			hora,
			observaciones,
		})

		res.status(201).json(turno)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al crear el turno' })
	}
}
const getTurnosByPaciente = async (req, res) => {
	try {
		const { idPaciente } = req.params
		const { Turno, Doctor, Paciente, Especialidad } = getModels()
		const turnos = await Turno.findAll({ where: { pacienteId: idPaciente }, include: [{ model: Doctor, include: [{ model: Especialidad }] }, { model: Paciente }] })
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
		const { Turno, Paciente, Doctor, Especialidad, Archivo } = getModels()
		const turnos = await Turno.findAll({ where: { doctorId: idDoctor }, include: [{ model: Paciente }, { model: Doctor, include: [{ model: Especialidad }] }, { model: Archivo }] })
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos' })
	}
}
const getTurnoById = async (req, res) => {
	try {
		const { idTurno } = req.params
		const { Turno, Paciente, Doctor, Archivo } = getModels()
		const turno = await Turno.findByPk(idTurno, { include: [{ model: Paciente }, { model: Doctor }, { model: Archivo }] })
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
		const { Turno } = getModels()
		const turno = await Turno.findByPk(idTurno)
		if (!turno) {
			return res.status(404).json({ error: 'Turno no encontrado' })
		}

		// Verificar si el turno ya está cancelado
		if (turno.estado === 'cancelado') {
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
		const { Turno } = getModels()
		const turno = await Turno.findByPk(idTurno)
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
		const { Turno } = getModels()
		const turno = await Turno.findByPk(idTurno)
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
		const { Turno } = getModels()
		const turnos = await Turno.findAll({ where: { doctorId: idDoctor, fecha, estado: { [Op.in]: ['pendiente', 'confirmado'] } } })
		res.json(turnos)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Error al obtener los turnos por fecha' })
	}
}

const getAllTurnos = async (req, res) => {
	try {
		const { Turno, Paciente, Doctor } = getModels()
		const turnos = await Turno.findAll({ include: [{ model: Paciente }, { model: Doctor }] })
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
		const { Turno, Paciente, Doctor } = getModels()
		const turnos = await Turno.findAll({ where: { fecha: fecha.toString() }, include: [{ model: Paciente, attributes: { exclude: ['password'] } }, { model: Doctor, attributes: { exclude: ['password'] } }] })

		res.json(turnos)
	} catch (error) {
		console.error('Error:', error)
		res.status(500).json({ error: 'Error al buscar turnos por fecha' })
	}
}

const getTurnosPendientes = async (req, res) => {
	try {
		const { Turno, Paciente, Doctor, Archivo } = getModels()
		const turnos = await Turno.findAll({ where: { estado: 'pendiente' }, include: [{ model: Paciente }, { model: Doctor }, { model: Archivo }] })
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
		const { Turno } = getModels()
		const turno = await Turno.findByPk(idTurno)
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
const getTurnosByEstadoAndPacienteId = async (req, res) => {

	try {
		const { idPaciente, estado } = req.params
		const { Turno, Paciente, Doctor, Especialidad } = getModels()
		const turnos = await Turno.findAll({ where: { pacienteId: idPaciente, estado }, include: [{ model: Paciente }, { model: Doctor, include: [{ model: Especialidad }] }] })
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
