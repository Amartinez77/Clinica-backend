/**
 * Script para generar especialidades básicas (legacy Mongoose)
 * Ejecutar con: node scripts/legacy_mongoose/generateEspecialidades.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import Especialidad from '../src/legacy_mongoose/models/Especialidad.js'

dotenv.config()

const especialidadesBasicas = [
  { nombre: 'Cardiología', descripcion: 'Especialidad del corazón' },
  { nombre: 'Dermatología', descripcion: 'Especialidad de la piel' },
  { nombre: 'Neurología', descripcion: 'Especialidad del sistema nervioso' },
]

const generateEspecialidades = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log(colors.green('Conectado a MongoDB (legacy)'))

    for (const esp of especialidadesBasicas) {
      const existe = await Especialidad.findOne({ nombre: esp.nombre })
      if (!existe) await Especialidad.create(esp)
    }

    console.log(colors.green('Especialidades legacy creadas'))
    process.exit(0)
  } catch (error) {
    console.error(colors.red('Error:'), error.message)
    process.exit(1)
  }
}

generateEspecialidades()
