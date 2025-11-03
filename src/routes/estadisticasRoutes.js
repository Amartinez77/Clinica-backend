import express from 'express'
import {
	getTurnosPorEspecialidad,
	getHorariosMasSolicitados,
	getTurnosPorDoctor,
	getTurnosPorMes,
	getEstadosTurnos,
	getIngresosPorEspecialidad,
	getResumenEstadisticas,
	getTurnosPorDiaSemana,
	getIngresosPorMes,
	getTopDoctoresSolicitados,
} from '../controllers/estadisticasController.js'
import { protegerRuta } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Rutas para estadísticas - requieren autenticación
router.get('/resumen', getResumenEstadisticas)
router.get('/turnos-por-especialidad', getTurnosPorEspecialidad)
router.get('/horarios-mas-solicitados', getHorariosMasSolicitados)
router.get('/turnos-por-doctor', getTurnosPorDoctor)
router.get('/turnos-por-mes', getTurnosPorMes)
router.get('/estados-turnos', getEstadosTurnos)
router.get('/ingresos-por-especialidad', getIngresosPorEspecialidad)

// Nuevas rutas de estadísticas
router.get('/turnos-por-dia-semana', getTurnosPorDiaSemana)
router.get('/ingresos-por-mes', getIngresosPorMes)
router.get('/top-doctores-solicitados', getTopDoctoresSolicitados)

export default router
