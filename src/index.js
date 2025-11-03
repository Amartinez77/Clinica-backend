import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import { conexionDB } from './config/db.js'
import pacienteRoutes from './routes/pacientes.js'
import doctorRoutes from './routes/doctores.js'
import especialidadesRoutes from './routes/especialidades.js'
import administradorRoutes from './routes/administradores.js'
import authRoutes from './routes/auth.js'
import mercadoPagoRoutes from './routes/mercadoPagoRoute.js'
import { corsConfig, corsWebhookConfig } from './config/cors.js'
import morgan from 'morgan'
import turnoRoutes from './routes/turnoRoutes.js'
import archivoRoutes from './routes/archivoRoutes.js'
import estadisticasRoutes from './routes/estadisticasRoutes.js'
import pagosRoutes from './routes/pagosRoutes.js'
import { swaggerDocs } from './config/swagger.js'

dotenv.config()

// conectar a la base de datos
conexionDB()

// instanciar express
const app = express()


// Middleware para procesar datos JSON en las peticiones HTTP.
app.use(express.json())

app.use(morgan('dev'))

//ruta de swagger
if(process.argv[2] === '--api'){
	swaggerDocs(app)
}
//rutas de la API

app.use('/api/mercadoPago',cors(corsWebhookConfig), mercadoPagoRoutes)
// CORS
app.use(cors(corsConfig))
app.use('/api/pacientes', pacienteRoutes)
app.use('/api/doctores', doctorRoutes)
app.use('/api/especialidades', especialidadesRoutes)
app.use('/api/administradores', administradorRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/turnos', turnoRoutes)
app.use('/api/archivos', archivoRoutes)
app.use('/api/estadisticas', estadisticasRoutes)
app.use('/api/pagos', pagosRoutes)

const port = process.env.PORT || 4000

app.listen(port, () => {
	console.log(colors.cyan.bold(`Servidor corriendo en el puerto: ${port}`))
	if(process.argv[2] === '--api'){
		console.log('Documentación Swagger en http://localhost:4000/api-docs')
		console.log('Documentación de referencia en http://localhost:4000/reference')
	}
})
