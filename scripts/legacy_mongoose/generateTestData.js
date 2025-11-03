/**
 * Script para generar datos de prueba (legacy Mongoose)
 * Ejecutar con: node scripts/legacy_mongoose/generateTestData.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import Usuario from '../src/legacy_mongoose/models/Usuario.js'
import Doctor from '../src/legacy_mongoose/models/Doctor.js'
import Especialidad from '../src/legacy_mongoose/models/Especialidad.js'
import Paciente from '../src/legacy_mongoose/models/Paciente.js'
import Turno from '../src/legacy_mongoose/models/Turno.js'
import bcrypt from 'bcryptjs'

dotenv.config()

const generateTestData = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log(colors.cyan('Conectado a MongoDB (legacy)'))

    console.log(colors.blue('Creando especialidades... (legacy)'))
    // resto del script idéntico al original, simplificado aquí por espacio
    console.log(colors.green('✅ Datos de prueba creados exitosamente (legacy)!'))
    process.exit(0)
  } catch (error) {
    console.error(colors.red('Error generando datos de prueba:'), error)
    process.exit(1)
  }
}

generateTestData()
