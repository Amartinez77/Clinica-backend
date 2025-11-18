
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
import jwtConfig from '../config/jwtConfig.js'
import colors from 'colors';
import { getModels } from '../config/sequelize.js'

export const protegerRuta = async (req, res, next) => {
  let token;

  console.log('[protegerRuta] Authorization header:', req.headers.authorization ? 'presente' : 'ausente');
  if (req.headers.authorization) {
    console.log('[protegerRuta] Authorization header value:', req.headers.authorization.substring(0, 30) + '...');
    console.log('[protegerRuta] Starts with Bearer:', req.headers.authorization.startsWith('Bearer'));
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('[protegerRuta] Token extraído:', token ? token.substring(0, 20) + '...' : 'null');

      const secret = process.env.JWT_SECRET || jwtConfig.secret
      const decoded = jwt.verify(token, secret);
      console.log('[protegerRuta] Token decodificado, usuario ID:', decoded?.usuario?.id);

      // Buscar al usuario en la base de datos usando el rol para elegir el modelo
      const { Usuario, Paciente, Doctor } = getModels() || {}
      if (!Usuario && !Paciente && !Doctor) {
        console.error(colors.red('[AUTH ERROR] Modelos SQL no inicializados en Sequelize'))
        return res.status(500).json({ msg: 'Error interno del servidor' })
      }

      const rolToken = String(decoded?.usuario?.rol || '').toLowerCase()
      let Model = Usuario
      if (rolToken.includes('pacient') && Paciente) Model = Paciente
      else if (rolToken.includes('doctor') && Doctor) Model = Doctor

      const usuarioDB = await Model.findByPk(decoded.usuario.id, { attributes: { exclude: ['password'] } })

      if (!usuarioDB) {
        console.log(colors.red(`[AUTH DEBUG] Usuario no encontrado para ID: ${decoded.usuario.id}, Rol: ${decoded.usuario.rol}`));
        return res.status(401).json({ msg: 'Usuario no encontrado' });
      }

      // Adjuntar el usuario al objeto req
      req.usuario = usuarioDB;
      console.log('[protegerRuta] Usuario autenticado, continuando...');
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

    // Aceptamos tanto string como array en la firma: autorizarRoles('admin') o autorizarRoles(['admin','doctor'])
    const required = Array.isArray(roles) ? roles.map(r => String(r).toLowerCase()) : [String(roles).toLowerCase()]
    const userRole = String(req.usuario._rol || req.usuario.rol || '').toLowerCase()

    if (!required.includes(userRole)) {
      console.log(colors.red(`[AUTH DEBUG] Acceso denegado para rol: ${userRole}. Roles requeridos: ${required.join(', ')}`))
      return res.status(403).json({ msg: 'Acceso denegado: No tienes los permisos necesarios' })
    }
    next();
  };
};