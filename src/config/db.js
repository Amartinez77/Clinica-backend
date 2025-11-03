import mongoose from 'mongoose'
import colors from 'colors'
import { exit } from 'node:process'

/*
 * Conexion a la base de datos MongoDB
 */
export const conexionDB = async () => {
	try {
		const connection = await mongoose.connect(process.env.DB_URL)
		const url = `${connection.connection.host}:${connection.connection.port}`
		console.log(colors.magenta.bold(`MongoDB se conectó: ${url}`))
	} catch (error) {
		console.log(colors.red(`Error: ${error.message}`))
		exit(1)
	}
}
