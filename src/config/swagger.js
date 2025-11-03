import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { apiReference } from '@scalar/express-api-reference'

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API Consultorios - Documentación',
			version: '1.0.0',
			description:
				'API para el sistema de gestión de consultorios médicos. Incluye funcionalidades para pacientes, doctores, turnos y administración.',
		},
		servers: [
			//se puede agregar el servidor desplegado en producción
			{
				url: process.env.DOC_URL || 'http://localhost:4000', // Cambia esto según tu entorno
				description: 'Servidor local',
			},
		],
		// Configuración de autenticación JWT
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Ingresa el token JWT en el formato: Bearer {token}',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	// Incluir tanto archivos de rutas (para comentarios inline) como archivos YAML de documentación
	apis: [
		'src/routes/*.js', // Rutas existentes (por si tienes algunos comentarios inline)
		'src/docs/*.yaml', // Archivos YAML de documentación separada
	],
}

const swaggerSpec = swaggerJsdoc(options)
export const swaggerDocs = app => {
	// Configurar la ruta para acceder a la documentación Swagger
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

	app.use(
		'/reference',
		apiReference({
			spec: {
				content: swaggerSpec,
			},
			theme: 'deepSpace',
			darkMode: true,
			layout: 'modern',
		})
	)

	// Opcional: Ruta para obtener el spec JSON
	app.get('/api-docs.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.send(swaggerSpec)
	})
	console.log('Documentación Swagger disponible en /api-docs')
}
