import express from 'express'

// Estadísticas deshabilitadas por decisión del equipo - devolver 404 para todas las rutas
const router = express.Router()

router.use((req, res) => {
	res.status(404).json({ error: 'Estadísticas deshabilitadas' })
})

export default router
