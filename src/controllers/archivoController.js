import { getModels } from '../config/sequelize.js'

export const subirArchivo = async (req, res) => {
	const { idTurno } = req.params
	const { tipo, url, nombre } = req.body

	const { Turno, Archivo } = getModels()
	const turno = await Turno.findByPk(idTurno)
	if (!turno) {
		return res.status(404).json({ message: 'Turno no encontrado' })
	}
	const nuevoArchivo = await Archivo.create({ tipo, url, nombre, turnoId: idTurno })

	return res.json({
		message: 'Archivo subido correctamente',
		id: nuevoArchivo.id,
		idTurno,
		archivo: {
			id: nuevoArchivo.id,
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
		const { Archivo } = getModels()

		// Buscar el archivo
		const archivo = await Archivo.findByPk(idArchivo)
		if (!archivo) {
			return res.status(404).json({ message: 'Archivo no encontrado' })
		}

		await Archivo.destroy({ where: { id: idArchivo } })

		return res.json({
			message: 'Archivo eliminado correctamente',
			archivoEliminado: archivo.url,
		})
	} catch (error) {
		console.error('Error al eliminar archivo:', error)
		return res.status(500).json({ message: 'Error interno del servidor al eliminar el archivo' })
	}
}
