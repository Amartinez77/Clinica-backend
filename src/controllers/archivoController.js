import Turno from '../models/Turno.js'
import Archivo from '../models/Archivo.js'

export const subirArchivo = async (req, res) => {
	const { idTurno } = req.params
	const { tipo, url, nombre } = req.body

	const turno = await Turno.findById(idTurno)
	if (!turno) {
		return res.status(404).json({ message: 'Turno no encontrado' })
	}

	const nuevoArchivo = new Archivo({ tipo, url, nombre })

	// Agregar el archivo al turno
	turno.archivos.push(nuevoArchivo._id)

	await Promise.allSettled([nuevoArchivo.save(), turno.save()])

	return res.json({
		message: 'Archivo subido correctamente',
		_id: nuevoArchivo._id,
		idTurno,
		archivo: {
			_id: nuevoArchivo._id,
			tipo: nuevoArchivo.tipo,
			url: nuevoArchivo.url,
			nombre: nuevoArchivo.nombre,
			fechaSubida: nuevoArchivo.fechaSubida || new Date(),
		},
	})
}

export const eliminarArchivo = async (req, res) => {
	try {
		const { idArchivo } = req.params

		// Buscar el archivo
		const archivo = await Archivo.findById(idArchivo)
		if (!archivo) {
			return res.status(404).json({ message: 'Archivo no encontrado' })
		}

		// Buscar el turno que contiene este archivo y removerlo
		const turno = await Turno.findOne({ archivos: idArchivo })
		if (turno) {
			turno.archivos = turno.archivos.filter(archivoId => archivoId.toString() !== idArchivo)
			await turno.save()
		}

		// Eliminar el archivo
		await Archivo.findByIdAndDelete(idArchivo)

		return res.json({
			message: 'Archivo eliminado correctamente',
			archivoEliminado: archivo.url,
		})
	} catch (error) {
		console.error('Error al eliminar archivo:', error)
		return res.status(500).json({ message: 'Error interno del servidor al eliminar el archivo' })
	}
}
