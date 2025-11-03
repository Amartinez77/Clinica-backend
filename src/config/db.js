import mongoose from 'mongoose'
import colors from 'colors'
import { exit } from 'node:process'

/*
 * Conexion a la base de datos MongoDB
 */
export const conexionDB = async () => {
	try {
		const dbUrl = process.env.DB_URL
		if (!dbUrl) {
			console.log(colors.yellow('DB_URL no definido — se omite la conexión a MongoDB.'))
			return null
		}

		const connection = await mongoose.connect(dbUrl)
		const url = `${connection.connection.host}:${connection.connection.port}`
		console.log(colors.magenta.bold(`MongoDB se conectó: ${url}`))
	} catch (error) {
		console.log(colors.red(`Error: ${error.message}`))
		exit(1)
	}
}
