// Configuración simple para JWT (uso local/desarrollo)
// Si en producción querés usar una variable de entorno, exportá JWT_SECRET y la prioridad la tomará process.env.JWT_SECRET
const jwtConfig = {
  // Genera una clave por defecto; puedes reemplazarla por la que prefieras
  secret: 'clinica_dev_secret_2025_!@#',
  expiresIn: '1h', // tiempo por defecto para tokens
}

export default jwtConfig
