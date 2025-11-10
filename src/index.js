import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import { connectSQL } from './config/sequelize.js'
import client from 'prom-client'
// Rutas se importarán dinámicamente después de inicializar las conexiones a BD
let pacienteRoutes, doctorRoutes, especialidadesRoutes, administradorRoutes, authRoutes, mercadoPagoRoutes
import { corsConfig, corsWebhookConfig } from './config/cors.js'
import morgan from 'morgan'
import turnoRoutes from './routes/turnoRoutes.js'
import archivoRoutes from './routes/archivoRoutes.js'
import estadisticasRoutes from './routes/estadisticasRoutes.js'
import pagosRoutes from './routes/pagosRoutes.js'
import { swaggerDocs } from './config/swagger.js'

dotenv.config()

const startApp = async () => {
	await connectSQL()

	// Importar rutas dinámicamente una vez que los modelos SQL estén inicializados
	const pacientesMod = await import('./routes/pacientes.js')
	pacienteRoutes = pacientesMod.default
	const doctoresMod = await import('./routes/doctores.js')
	doctorRoutes = doctoresMod.default
	const especialidadesMod = await import('./routes/especialidades.js')
	especialidadesRoutes = especialidadesMod.default
	const administradoresMod = await import('./routes/administradores.js')
	administradorRoutes = administradoresMod.default
	const authMod = await import('./routes/auth.js')
	authRoutes = authMod.default
	const mercadoMod = await import('./routes/mercadoPagoRoute.js')
	mercadoPagoRoutes = mercadoMod.default
}

// iniciar conexiones y carga de rutas
await startApp()

// instanciar express
const app = express()


// Middleware para procesar datos JSON en las peticiones HTTP.
app.use(express.json())

app.use(morgan('dev'))

// ----- Health & Metrics Setup -----
// Health endpoint: simple status plus SQL connectivity flag
// Prometheus metrics: default metrics + HTTP request duration histogram
const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics({ prefix: 'clinica_' })

// Histogram para tiempos de respuesta HTTP
const httpRequestDuration = new client.Histogram({
	name: 'clinica_http_request_duration_seconds',
	help: 'Duración de las peticiones HTTP en segundos',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5]
})

// Middleware para medir duración
app.use((req, res, next) => {
	const start = process.hrtime.bigint()
	res.on('finish', () => {
		const diff = Number(process.hrtime.bigint() - start) / 1e9
		// Sanitizar route (usar req.route?.path si existe, fallback a req.path)
		const route = req.route && req.route.path ? req.route.path : req.path
		httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, diff)
	})
	next()
})

// Health
app.get('/health', async (req, res) => {
	let sqlStatus = 'unknown'
	try {
		// verificar conexión simple con authenticate si existe
		const sequelizeModule = await import('./config/sequelize.js')
		const sequelizeInstance = sequelizeModule.getSequelize()
		if (sequelizeInstance) {
			await sequelizeInstance.authenticate()
			sqlStatus = 'up'
		} else {
			sqlStatus = 'disabled'
		}
	} catch (e) {
		sqlStatus = 'error'
	}
	res.json({ status: 'ok', sql: sqlStatus, time: new Date().toISOString() })
})

// Metrics
app.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', client.register.contentType)
		res.end(await client.register.metrics())
	} catch (err) {
		res.status(500).json({ error: 'error generating metrics' })
	}
})

//ruta de swagger
if (process.argv[2] === '--api') {
	swaggerDocs(app)
}
//rutas de la API

app.use('/api/mercadoPago', cors(corsWebhookConfig), mercadoPagoRoutes)
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
	if (process.argv[2] === '--api') {
		console.log('Documentación Swagger en http://localhost:4000/api-docs')
		console.log('Documentación de referencia en http://localhost:4000/reference')
	}
})
