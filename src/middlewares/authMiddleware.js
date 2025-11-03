
/**
 * @fileoverview Contiene los middlewares para la autenticación y autorización de rutas.
 * Este archivo es crucial para la seguridad de la API, ya que se encarga de:
 * 1.  **protegerRuta**: Verificar la validez de un JSON Web Token (JWT) presente en los headers de la petición.
 * Si el token es válido, decodifica la información del usuario y la adjunta al objeto `req`.
 * 2.  **autorizarRoles**: Asegurar que el usuario autenticado (con su rol extraído del token)
 * tenga los permisos necesarios para acceder a una ruta específica.
 *
 * Estos middlewares se utilizan en las definiciones de rutas para controlar el acceso.
 */

// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import colors from 'colors';
import Usuario from '../models/Usuario.js'; // Importa el modelo base Usuario

export const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar al usuario en la base de datos usando el modelo base Usuario
      // Mongoose se encargará de encontrar el discriminador correcto
      const usuario = await Usuario.findById(decoded.usuario.id).select('-password');

      if (!usuario) {
        console.log(colors.red(`[AUTH DEBUG] Usuario no encontrado para ID: ${decoded.usuario.id}, Rol: ${decoded.usuario.rol}`));
        return res.status(401).json({ msg: 'Usuario no encontrado' });
      }

      // Adjuntar el usuario al objeto req
      req.usuario = usuario;
      next();

    } catch (error) {
      console.error(colors.red(`[AUTH ERROR] Error de autenticación:`, error.message));
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token expirado' });
      }
      return res.status(401).json({ msg: 'Token no válido o no autorizado' });
    }
  } else {
    console.log(colors.red(`[AUTH DEBUG] No hay token en los headers de autorización.`));
    return res.status(401).json({ msg: 'No autorizado, no hay token' });
  }
};

/**
 * Middleware para autorizar roles específicos.
 * @param {Array<String>} roles - Un array de roles permitidos (ej., ['admin', 'doctor']).
 */
export const autorizarRoles = (roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(403).json({ msg: 'Acceso denegado: No autenticado' });
    }

    // Aquí usamos el campo '_rol' que Mongoose añade automáticamente a los discriminadores
    // Opcionalmente, puedes usar el campo 'rol' que definimos en el esquema base si lo prefieres.
    // Ambos deberían contener el mismo valor ('paciente', 'doctor', 'admin').
    if (!roles.includes(req.usuario._rol)) { // Usamos _rol
      console.log(colors.red(`[AUTH DEBUG] Acceso denegado para rol: ${req.usuario._rol}. Roles requeridos: ${roles.join(', ')}`));
      return res.status(403).json({ msg: 'Acceso denegado: No tienes los permisos necesarios' });
    }
    next();
  };
};