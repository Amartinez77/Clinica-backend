// src/routes/administradores.js
import express from 'express';
const router = express.Router();
import { registrarAdmin, getAdmins } from '../controllers/adminController.js';
import { protegerRuta, autorizarRoles } from '../middlewares/authMiddleware.js';
import { body } from 'express-validator';
import { handleInputErrors } from '../middlewares/validacionInputs.js';

// Validaciones comunes para registrar cualquier tipo de usuario (heredado de Usuario)
// Las mismas que ya definimos en routes/pacientes.js y routes/doctores.js
const registrarUsuarioValidationRules = [
  body('dni')
    .notEmpty().withMessage('El DNI es obligatorio')
    .isString().withMessage('El DNI debe ser una cadena de texto')
    .isLength({ min: 7, max: 8 }).withMessage('El DNI debe tener entre 7 y 8 dígitos')
    .trim(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .isString().withMessage('La contraseña debe ser una cadena de texto'),
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio').trim()
];

// Validaciones adicionales específicas para Administrador (en este caso, ninguna adicional, solo email opcional)
const registrarAdminValidationRules = [
  ...registrarUsuarioValidationRules, // Hereda las validaciones básicas de usuario
  body('email').optional().isEmail().withMessage('El email no es válido') // Email es opcional
];

// Ruta para registrar un nuevo administrador.
// MUY IMPORTANTE: Esta ruta DEBE ser protegida.
// Para el primer admin, se sugiere insertarlo directamente en MongoDB Compass
// o desactivar temporalmente la protección SOLO para el primer registro.
router.post('/register',
  protegerRuta, // Requiere que el usuario esté autenticado para registrar un admin
  autorizarRoles(['admin']), // Solo un admin puede registrar a otro admin
  registrarAdminValidationRules, // Aplica las validaciones del body
  handleInputErrors,           // Maneja los errores de validación
  registrarAdmin
);

// Ruta para obtener todos los administradores.
// También debe estar protegida y solo accesible por otros administradores.
router.get('/',
  protegerRuta,
  autorizarRoles(['admin']),
  getAdmins
);

export default router;