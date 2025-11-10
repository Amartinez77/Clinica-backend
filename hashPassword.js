// hashPassword.js

import bcrypt from 'bcryptjs'; // Importa la librería bcryptjs

// Función asíncrona para hashear la contraseña
async function generateHashedPassword() {
  const plainPassword = 'SuperAdmin123'; // <-- CAMBIA ESTO por la contraseña que quieras usar para tu administrador
  const saltRounds = 10; // Número de "rondas" para generar el salt (costo computacional)

  try {
    const salt = await bcrypt.genSalt(saltRounds); // Genera un salt aleatorio
    const hashedPassword = await bcrypt.hash(plainPassword, salt); // Hashea la contraseña con el salt

    console.log(`Contraseña en texto plano: ${plainPassword}`);
    console.log(`Contraseña hasheada: ${hashedPassword}`);
    console.log("\n¡Copia la 'Contraseña hasheada' y pégala en MongoDB Compass!");
  } catch (error) {
    console.error("Error al hashear la contraseña:", error);
  }
}

// Llama a la función para ejecutarla
generateHashedPassword();