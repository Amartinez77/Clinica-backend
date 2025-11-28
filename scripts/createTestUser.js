import dotenv from 'dotenv'
import colors from 'colors'
import bcrypt from 'bcryptjs'
import { connectSQL, getModels } from '../src/config/sequelize.js'

dotenv.config()

async function run() {
  try {
    const sequelize = await connectSQL()
    if (!sequelize) {
      console.log(colors.red('No se pudo iniciar conexión SQL.'))
      process.exit(1)
    }

    await sequelize.sync()

    const { Usuario } = getModels() || {}
    if (!Usuario) {
      console.log(colors.red('Modelo Usuario no disponible.'))
      process.exit(1)
    }

    // Create test patient
    const testPatient = {
      dni: '31988653',
      email: 'paciente@test.com',
      password: 'qwerty',
      nombre: 'Juan',
      apellido: 'Paziente',
      tipo: 'paciente',
      rol: 'paciente',
    }

    let user = await Usuario.findOne({ where: { dni: testPatient.dni } })
    if (user) {
      console.log(colors.yellow(`Usuario con DNI ${testPatient.dni} ya existe. Actualizando...`))
      const hashed = await bcrypt.hash(testPatient.password, 10)
      user.password = hashed
      user.email = testPatient.email
      await user.save()
      console.log(colors.green(`Actualizado.`))
    } else {
      const hashed = await bcrypt.hash(testPatient.password, 10)
      user = await Usuario.create({
        ...testPatient,
        password: hashed,
      })
      console.log(colors.green(`Usuario paciente creado.`))
    }

    console.log(colors.cyan(`DNI: ${testPatient.dni}`))
    console.log(colors.cyan(`Contraseña: ${testPatient.password}`))
    console.log(colors.cyan(`Tipo: ${testPatient.tipo}`))
    process.exit(0)
  } catch (err) {
    console.error(colors.red('Error:'), err?.message || err)
    process.exit(1)
  }
}

run()
