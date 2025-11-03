import { getModels } from '../config/sequelize.js'

// crear una nueva especialidad (Sequelize)
export const crearEspecialidad = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body
    const { Especialidad } = getModels() || {}
    if (!Especialidad) return res.status(500).json({ message: 'Model Especialidad no inicializado' })

    // Verificar si la especialidad ya existe
    const especialidadExistente = await Especialidad.findOne({ where: { nombre } })
    if (especialidadExistente) return res.status(400).json({ message: 'La especialidad ya existe' })

    const nueva = await Especialidad.create({ nombre, descripcion })
    res.status(201).json({ message: 'Especialidad creada exitosamente', especialidad: nueva })
  } catch (error) {
    console.error('Error al crear la especialidad:', error)
    if (error.name && error.name.includes('Sequelize')) {
      return res.status(400).json({ message: 'Error de validación en Especialidad', details: error.message })
    }
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener todas las especialidades
export const getEspecialidades = async (req, res) => {
  try {
    const { Especialidad } = getModels() || {}
    if (!Especialidad) return res.status(500).json({ message: 'Model Especialidad no inicializado' })
    const listado = await Especialidad.findAll()
    res.status(200).json(listado)
  } catch (error) {
    console.error('Error al obtener especialidades:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Obtener una especialidad por ID
export const getEspecialidadById = async (req, res) => {
  try {
    const { id } = req.params
    const { Especialidad } = getModels() || {}
    if (!Especialidad) return res.status(500).json({ message: 'Model Especialidad no inicializado' })

    const especialidad = await Especialidad.findByPk(id)
    if (!especialidad) return res.status(404).json({ message: 'Especialidad no encontrada' })
    res.status(200).json(especialidad)
  } catch (error) {
    console.error('Error al obtener la especialidad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Actualizar una especialidad
export const actualizarEspecialidad = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion } = req.body
    const { Especialidad } = getModels() || {}
    if (!Especialidad) return res.status(500).json({ message: 'Model Especialidad no inicializado' })

    const especialidad = await Especialidad.findByPk(id)
    if (!especialidad) return res.status(404).json({ message: 'Especialidad no encontrada' })

    // Si se cambia el nombre, comprobar unicidad
    if (nombre && nombre !== especialidad.nombre) {
      const dup = await Especialidad.findOne({ where: { nombre } })
      if (dup) return res.status(400).json({ message: 'La especialidad ya existe' })
      especialidad.nombre = nombre
    }
    if (descripcion !== undefined) especialidad.descripcion = descripcion

    await especialidad.save()
    res.status(200).json({ message: 'Especialidad actualizada exitosamente', especialidad })
  } catch (error) {
    console.error('Error al actualizar la especialidad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// Eliminar una especialidad
export const eliminarEspecialidad = async (req, res) => {
  try {
    const { id } = req.params
    const { Especialidad } = getModels() || {}
    if (!Especialidad) return res.status(500).json({ message: 'Model Especialidad no inicializado' })

    const especialidad = await Especialidad.findByPk(id)
    if (!especialidad) return res.status(404).json({ message: 'Especialidad no encontrada' })

    await especialidad.destroy()
    res.status(200).json({ message: 'Especialidad eliminada exitosamente' })
  } catch (error) {
    console.error('Error al eliminar la especialidad:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
