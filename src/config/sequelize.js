import { Sequelize } from 'sequelize'
import colors from 'colors'
import initModels from '../sql_models/index.js'
import sqlConfig from './sqlConfig.js'

// Usamos un archivo de configuración simple (sqlConfig.js) en lugar de
// depender de variables de entorno por ahora.
const dbType = sqlConfig.dbType || 'mongo'
let sequelize

/**
 * connectSQL: intenta conectarse a una base de datos SQL (mysql o postgres)
 * - Usa SQL_URL si está definido (cadena de conexión completa)
 * - O usa SQL_DATABASE, SQL_USERNAME, SQL_PASSWORD, SQL_HOST, SQL_PORT
 * - Inicializa modelos de ejemplo (Usuario)
 */
export const connectSQL = async () => {
  if (dbType !== 'mysql' && dbType !== 'postgres') {
    console.log(colors.yellow(`DB_TYPE='${dbType}' — no se iniciará conexión SQL.`))
    return null
  }

  const dialect = dbType === 'mysql' ? 'mysql' : 'postgres'

  try {
    const sqlUrl = sqlConfig.sqlUrl || null
    if (sqlUrl) {
      sequelize = new Sequelize(sqlUrl, { dialect, logging: false })
    } else {
      const database = sqlConfig.database || 'clinica_db'
      const username = sqlConfig.username || 'root'
      const password = sqlConfig.password || 'root'
      const host = sqlConfig.host || 'localhost'
      const port = sqlConfig.port || undefined

      sequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect,
        logging: false,
      })
    }

    await sequelize.authenticate()
    console.log(colors.magenta.bold(`SQL (${dialect}) conectado.`))

    // Inicializar modelos y asociaciones
    try {
      const models = initModels(sequelize)

      // Si está activado el sync forzado en la configuración, recrear las tablas
      if (sqlConfig.sync) {
        console.log(colors.yellow('SQL sync habilitado: sincronizando esquemas (force: true) — se recrearán las tablas'))
        await sequelize.sync({ force: true })
        console.log(colors.green('Sincronización SQL completada (tablas recreadas).'))
      }

      // exportar models en la instancia para uso si se requiere
      sequelize.models = models
    } catch (err) {
      console.log(colors.yellow(`Advertencia al inicializar modelos SQL: ${err.message}`))
    }

    return sequelize
  } catch (error) {
    console.log(colors.red(`Error SQL: ${error.message}`))
    return null
  }
}

function getSequelize() {
  return sequelize
}

export { getSequelize }

export function getModels() {
  return sequelize ? sequelize.models : null
}

export default getSequelize
