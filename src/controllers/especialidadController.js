import Especialidad from "../models/Especialidad.js";

// crear una nueva especialidad
export const crearEspecialidad = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Verificar si la especialidad ya existe
    const especialidadExistente = await Especialidad.findOne({ nombre });
    if (especialidadExistente) {
      return res.status(400).json({ message: 'La especialidad ya existe' });
    }

    // Crear una nueva especialidad
    const nuevaEspecialidad = new Especialidad({ nombre });
    await nuevaEspecialidad.save();

    res.status(201).json({ message: 'Especialidad creada exitosamente', especialidad: nuevaEspecialidad });
  } catch (error) {
    console.error('Error al crear la especialidad:', error.message);
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: error.message, errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'La especialidad ya existe' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las especialidades
export const getEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.find();
    res.status(200).json(especialidades);
  } catch (error) {
    console.error('Error al obtener especialidades:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener una especialidad por ID
export const getEspecialidadById = async (req, res) => {
  try {
    const { id } = req.params;
    const especialidad = await Especialidad.findById(id);
    if (!especialidad) {
      return res.status(404).json({ message: 'Especialidad no encontrada' });
    }
    res.status(200).json(especialidad);
  } catch (error) {
    console.error('Error al obtener la especialidad:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de especialidad inválido' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar una especialidad
export const actualizarEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Verificar si la especialidad existe
    const especialidadExistente = await Especialidad.findById(id);
    if (!especialidadExistente) {
      return res.status(404).json({ message: 'Especialidad no encontrada' });
    }
    res.status(200).json({ message: 'Especialidad actualizada exitosamente', especialidad: especialidadExistente });
  } catch (error) {
    console.error('Error al actualizar la especialidad:', error.message);
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: error.message, errors });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'La especialidad ya existe' });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de especialidad inválido' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar una especialidad (borrado lógico)
export const eliminarEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la especialidad existe
    const especialidadExistente = await Especialidad.findById(id);
    if (!especialidadExistente) {
      return res.status(404).json({ message: 'Especialidad no encontrada' });
    }
    // Eliminar la especialidad (borrado lógico)
    await Especialidad.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error al eliminar la especialidad:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de especialidad inválido' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
  res.status(200).json({ message: 'Especialidad eliminada exitosamente' });
};
