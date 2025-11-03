import dotenv from 'dotenv'
import colors from 'colors'
import bcrypt from 'bcryptjs'
import { connectSQL, getModels, getSequelize } from '../src/config/sequelize.js'

// Crea un usuario admin en la base SQL si no existe
// Credenciales: DNI 00000000 (8 dígitos) y password 'qwerty'
// Nota: el flujo de login actual usa dni + password, por eso definimos un DNI válido.

dotenv.config()

async function run() {
  try {
    const sequelize = await connectSQL()
    if (!sequelize) {
      console.log(colors.red('No se pudo iniciar conexión SQL. Verificá DB_TYPE y credenciales.'))
      process.exit(1)
    }

    // Asegurar que las tablas existan (no force)
    await sequelize.sync()

    const { Usuario } = getModels() || {}
    if (!Usuario) {
      console.log(colors.red('Modelo Usuario no disponible.'))
      process.exit(1)
    }

    const DNI = process.env.ADMIN_DNI || '00000000'
    const PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty'

    let admin = await Usuario.findOne({ where: { dni: DNI } })
    if (admin) {
      console.log(colors.yellow(`Ya existe un usuario con DNI ${DNI}. Actualizando rol y password...`))
      const hashed = await bcrypt.hash(PASSWORD, 10)
      admin.password = hashed
      admin._rol = 'admin'
      admin.nombre = admin.nombre || 'ADMIN'
      admin.apellido = admin.apellido || ''
      await admin.save()
      console.log(colors.green(`Admin actualizado. DNI=${DNI}`))
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash(PASSWORD, 10)
    admin = await Usuario.create({
      dni: DNI,
      email: null,
      password: hashedPassword,
      nombre: 'ADMIN',
      apellido: '',
      _rol: 'admin',
    })

    console.log(colors.green(`Administrador creado con éxito.`))
    console.log(colors.cyan(`DNI: ${DNI}`))
    console.log(colors.cyan(`Password: ${PASSWORD}`))
    process.exit(0)
  } catch (err) {
    console.error(colors.red('Error creando admin:'), err?.message || err)
    process.exit(1)
  }
}

run()
