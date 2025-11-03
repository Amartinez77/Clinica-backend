// Configuración simple para conexión SQL (uso local, sin variables de entorno)
const sqlConfig = {
  // 'mysql' o 'postgres'
  dbType: 'mysql',
  // si quieres usar una URL de conexión en vez de separar campos, colócala aquí
  sqlUrl: null,
  database: 'clinica_db',
  username: 'root',
  password: 'root',
  host: 'localhost',
  port: 3306,
  // Si sync = true se ejecutará sequelize.sync({ force: true }) al iniciar => recrea todas las tablas
  sync: true,
}

export default sqlConfig
