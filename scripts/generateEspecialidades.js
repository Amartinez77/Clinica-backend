/**
 * Script para generar especialidades básicas
 * Ejecutar con: node scripts/generateEspecialidades.js
 *
 * Este script crea las especialidades médicas más comunes
 * para que todos los desarrolladores del proyecto tengan los mismos datos base.
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import Especialidad from '../src/models/Especialidad.js'

dotenv.config()

const especialidadesBasicas = [
	{
		nombre: 'Cardiología',
		descripcion:
			'Especialidad médica que se encarga del estudio, diagnóstico y tratamiento de las enfermedades del corazón y del aparato circulatorio.',
	},
	{
		nombre: 'Dermatología',
		descripcion:
			'Especialidad médica que se encarga del estudio de la estructura y función de la piel, así como de las enfermedades que la afectan.',
	},
	{
		nombre: 'Neurología',
		descripcion:
			'Especialidad médica que trata los trastornos del sistema nervioso, incluyendo el cerebro, la médula espinal y los nervios.',
	},
	{
		nombre: 'Pediatría',
		descripcion:
			'Especialidad médica que se encarga de la salud y el cuidado médico de bebés, niños y adolescentes.',
	},
	{
		nombre: 'Traumatología',
		descripcion:
			'Especialidad médica que se dedica al estudio y tratamiento de las lesiones del aparato locomotor (huesos, articulaciones, músculos, tendones y ligamentos).',
	},
	{
		nombre: 'Ginecología',
		descripcion:
			'Especialidad médica que se ocupa de la salud del aparato reproductor femenino y del sistema urogenital de la mujer.',
	},
	{
		nombre: 'Oftalmología',
		descripcion:
			'Especialidad médica que se encarga del estudio de las enfermedades del ojo y su tratamiento, incluyendo el globo ocular, la musculatura ocular, el sistema lagrimal y los párpados.',
	},
	{
		nombre: 'Otorrinolaringología',
		descripcion:
			'Especialidad médica que se encarga de la prevención, diagnóstico y tratamiento de las enfermedades del oído, nariz y garganta.',
	},
	{
		nombre: 'Psiquiatría',
		descripcion:
			'Especialidad médica dedicada al estudio, prevención, diagnóstico y tratamiento de los trastornos mentales.',
	},
	{
		nombre: 'Medicina General',
		descripcion:
			'Especialidad médica que proporciona atención sanitaria continua e integral al individuo y la familia, abarcando todas las edades, sexos, sistemas orgánicos y enfermedades.',
	},
]

const generateEspecialidades = async () => {
	try {
		// Conectar a MongoDB
		console.log(colors.cyan('🔗 Conectando a MongoDB...'))
		await mongoose.connect(process.env.DB_URL)
		console.log(colors.green('✅ Conectado a MongoDB exitosamente'))

		console.log(colors.yellow('\n📋 Iniciando creación de especialidades básicas...'))

		let especialidadesCreadas = 0
		let especialidadesExistentes = 0

		for (const especialidadData of especialidadesBasicas) {
			try {
				// Verificar si ya existe
				const especialidadExistente = await Especialidad.findOne({
					nombre: especialidadData.nombre,
				})

				if (especialidadExistente) {
					console.log(colors.gray(`   ⚪ ${especialidadData.nombre} - Ya existe`))
					especialidadesExistentes++
				} else {
					// Crear nueva especialidad
					const nuevaEspecialidad = await Especialidad.create(especialidadData)
					console.log(colors.green(`   ✅ ${especialidadData.nombre} - Creada exitosamente`))
					especialidadesCreadas++
				}
			} catch (error) {
				console.log(colors.red(`   ❌ Error creando ${especialidadData.nombre}: ${error.message}`))
			}
		}

		// Resumen final
		console.log(colors.cyan('\n📊 RESUMEN:'))
		console.log(colors.green(`   ✅ Especialidades creadas: ${especialidadesCreadas}`))
		console.log(colors.gray(`   ⚪ Especialidades que ya existían: ${especialidadesExistentes}`))
		console.log(colors.cyan(`   📋 Total de especialidades: ${especialidadesCreadas + especialidadesExistentes}`))

		// Verificar total en base de datos
		const totalEspecialidades = await Especialidad.countDocuments()
		console.log(colors.magenta(`   🏥 Total en base de datos: ${totalEspecialidades}`))

		// Mostrar todas las especialidades actuales
		console.log(colors.cyan('\n🏥 Especialidades disponibles en el sistema:'))
		const todasLasEspecialidades = await Especialidad.find({}).sort({ nombre: 1 })
		todasLasEspecialidades.forEach((esp, index) => {
			console.log(colors.white(`   ${index + 1}. ${esp.nombre}`))
		})

		console.log(colors.green('\n🎉 ¡Script ejecutado exitosamente!'))
		console.log(colors.cyan('💡 Ahora puedes crear doctores asignándoles estas especialidades.'))
	} catch (error) {
		console.error(colors.red('\n❌ Error ejecutando el script:'), error.message)
		console.error(colors.red('💡 Verifica que:'))
		console.error(colors.red('   - MongoDB esté ejecutándose'))
		console.error(colors.red('   - El archivo .env tenga la variable DB_URL correcta'))
		console.error(colors.red('   - Tengas conexión a internet (si usas MongoDB Atlas)'))
		process.exit(1)
	} finally {
		// Cerrar conexión
		await mongoose.connection.close()
		console.log(colors.gray('\n🔌 Conexión a MongoDB cerrada'))
		process.exit(0)
	}
}

// Ejecutar el script
generateEspecialidades()
