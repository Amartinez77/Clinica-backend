import { getSequelize } from '../config/sequelize.js'

const query = async (sql, replacements) => {
  const sequelize = getSequelize()
  const [results] = await sequelize.query(sql, { replacements })
  return results
}

const getResumenEstadisticas = async (req, res) => {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM turnos) as totalTurnos,
        (SELECT COUNT(*) FROM doctores) as totalDoctores,
        (SELECT COUNT(*) FROM especialidades) as totalEspecialidades
    `
    const results = await query(sql)
    res.json({ totals: results[0] || {} })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener resumen de estadísticas' })
  }
}

const getTurnosPorEspecialidad = async (req, res) => {
  try {
    const sql = `
      SELECT e.id as especialidadId, e.nombre as especialidad, COUNT(t.id) as totalTurnos
      FROM turnos t
      JOIN doctores d ON t.doctorId = d.id
      JOIN especialidades e ON d.especialidadId = e.id
      GROUP BY e.id, e.nombre
      ORDER BY totalTurnos DESC
    `
    const results = await query(sql)
    res.json({ raw: results })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener turnos por especialidad' })
  }
}

const getHorariosMasSolicitados = async (req, res) => {
  try {
    const sql = `SELECT hora as horario, COUNT(id) as totalTurnos FROM turnos GROUP BY hora ORDER BY totalTurnos DESC LIMIT 10`
    const results = await query(sql)
    res.json({ raw: results })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener horarios más solicitados' })
  }
}
// Estadísticas eliminadas - archivo placeholder vacío para evitar importaciones erróneas.

// Este archivo se deja intencionalmente vacío. Las rutas de estadísticas devuelven 404.
