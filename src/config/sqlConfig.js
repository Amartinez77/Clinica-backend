// Configuración simple para conexión SQL.
// Prioriza variables de entorno si están definidas (recomendado para staging/producción).
const sqlConfig = {
  // 'mysql' o 'postgres'
  dbType: process.env.DB_TYPE || 'mysql',
  // si querés usar una URL completa (ej: mysql://user:pass@host:port/db) podés definir SQL_URL
  sqlUrl: process.env.SQL_URL || null,
  database: process.env.SQL_DATABASE || 'clinica_db',
  username: process.env.SQL_USERNAME || 'root',
  password: process.env.SQL_PASSWORD || 'root',
  host: process.env.SQL_HOST || 'localhost',
  port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 3306,
  // Si sync = true se ejecutará sequelize.sync({ force: true }) al iniciar => recrea todas las tablas
  // Por seguridad por defecto lo dejamos en false. Cambia a true sólo si querés recrear esquema desde cero.
  sync: process.env.SQL_SYNC === 'true' || false,
}

export default sqlConfig
