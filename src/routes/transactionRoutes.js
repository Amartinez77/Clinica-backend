/**
 * 🔐 EJEMPLOS DE USO EN CONTROLLERS
 * 
 * Cómo usar las operaciones con transacciones en tus endpoints
 */

import express from 'express';
import {
  agendarTurno,
  cancelarTurno,
  registrarDoctor,
  registrarPaciente,
  cambiarDoctorTurno
} from '../services/transactionServices.js';

const router = express.Router();

// ============================================================
// TURNOS - Operaciones críticas con transacciones
// ============================================================

/**
 * POST /api/turnos
 * Agendar un nuevo turno
 * 
 * Body:
 * {
 *   "pacienteId": 1,
 *   "doctorId": 1,
 *   "fechaHora": "2025-12-01T14:00:00",
 *   "razonConsulta": "Consulta general"
 * }
 */
router.post('/turnos', async (req, res) => {
  try {
    const { pacienteId, doctorId, fechaHora, razonConsulta } = req.body;
    
    // Validar datos de entrada
    if (!pacienteId || !doctorId || !fechaHora) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: pacienteId, doctorId, fechaHora'
      });
    }
    
    // Llamar a la función con transacción
    const result = await agendarTurno({
      pacienteId,
      doctorId,
      fechaHora,
      razonConsulta
    });
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        turno: result.turno,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error en POST /turnos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/turnos/:id
 * Cancelar un turno
 * 
 * Query:
 * ?motivo=Paciente no podría asistir
 */
router.delete('/turnos/:id', async (req, res) => {
  try {
    const turnoId = req.params.id;
    const motivo = req.query.motivo || 'No especificado';
    
    // Llamar a la función con transacción
    const result = await cancelarTurno(turnoId, motivo);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        turno: result.turno,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error en DELETE /turnos/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PATCH /api/turnos/:id/doctor
 * Cambiar el doctor de un turno
 * 
 * Body:
 * {
 *   "nuevoDoctoId": 2
 * }
 */
router.patch('/turnos/:id/doctor', async (req, res) => {
  try {
    const turnoId = req.params.id;
    const { nuevoDoctoId } = req.body;
    
    if (!nuevoDoctoId) {
      return res.status(400).json({
        success: false,
        error: 'Falta campo requerido: nuevoDoctoId'
      });
    }
    
    // Llamar a la función con transacción
    const result = await cambiarDoctorTurno(turnoId, nuevoDoctoId);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        turno: result.turno,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error en PATCH /turnos/:id/doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ============================================================
// DOCTORES - Operaciones críticas con transacciones
// ============================================================

/**
 * POST /api/doctores
 * Registrar un nuevo doctor
 * 
 * Body:
 * {
 *   "nombre": "Dr. Juan Pérez",
 *   "email": "juan@clinica.com",
 *   "especialidadId": 1,
 *   "numeroLicencia": "123456",
 *   "telefonoConsultorio": "555-1234",
 *   "direccionConsultorio": "Calle Principal 123",
 *   "passwordHash": "hashed_password_here"
 * }
 */
router.post('/doctores', async (req, res) => {
  try {
    const {
      nombre,
      email,
      especialidadId,
      numeroLicencia,
      telefonoConsultorio,
      direccionConsultorio,
      passwordHash
    } = req.body;
    
    // Validar datos de entrada
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, email'
      });
    }
    
    // Llamar a la función con transacción
    const result = await registrarDoctor({
      nombre,
      email,
      especialidadId,
      numeroLicencia,
      telefonoConsultorio,
      direccionConsultorio,
      passwordHash
    });
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        doctor: result.doctor,
        usuario: result.usuario,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error en POST /doctores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ============================================================
// PACIENTES - Operaciones críticas con transacciones
// ============================================================

/**
 * POST /api/pacientes
 * Registrar un nuevo paciente
 * 
 * Body:
 * {
 *   "nombre": "Juan Corleone",
 *   "email": "juan@email.com",
 *   "telefonoContacto": "555-9876",
 *   "direccion": "Calle Secundaria 456",
 *   "documentoIdentidad": "12345678",
 *   "numeroHistoriaClinica": "HC-12345",
 *   "grupoSanguineo": "O+",
 *   "alergias": "Penicilina",
 *   "passwordHash": "hashed_password_here"
 * }
 */
router.post('/pacientes', async (req, res) => {
  try {
    const {
      nombre,
      email,
      telefonoContacto,
      direccion,
      documentoIdentidad,
      numeroHistoriaClinica,
      grupoSanguineo,
      alergias,
      passwordHash
    } = req.body;
    
    // Validar datos de entrada
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, email'
      });
    }
    
    // Llamar a la función con transacción
    const result = await registrarPaciente({
      nombre,
      email,
      telefonoContacto,
      direccion,
      documentoIdentidad,
      numeroHistoriaClinica,
      grupoSanguineo,
      alergias,
      passwordHash
    });
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        paciente: result.paciente,
        usuario: result.usuario,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error en POST /pacientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;

/**
 * RESUMEN DE CAMBIOS RECOMENDADOS
 * 
 * Archivo: src/index.js o src/routes/index.js
 * 
 * Agregar:
 * ──────────────────────────────────────────────────
 * import transactionRoutes from './routes/transactionRoutes.js';
 * 
 * app.use('/api', transactionRoutes);
 * 
 * 
 * ESTRUCTURA DE RESPUESTA
 * ──────────────────────────────────────────────────
 * 
 * Éxito:
 * {
 *   "success": true,
 *   "turno": { id, pacienteId, ... },
 *   "message": "Turno agendado exitosamente"
 * }
 * 
 * Error:
 * {
 *   "success": false,
 *   "error": "Descripción del error"
 * }
 * 
 * 
 * TESTING (Con CURL)
 * ──────────────────────────────────────────────────
 * 
 * # Agendar turno (ej: paciente 1, doctor 1, mañana 14:00)
 * curl -X POST http://localhost:3000/api/turnos \\
 *   -H "Content-Type: application/json" \\
 *   -d '{
 *     "pacienteId": 1,
 *     "doctorId": 1,
 *     "fechaHora": "2025-12-18T14:00:00",
 *     "razonConsulta": "Consulta general"
 *   }'
 * 
 * # Cancelar turno
 * curl -X DELETE "http://localhost:3000/api/turnos/1?motivo=Cambio%20de%20horario"
 * 
 * # Cambiar doctor
 * curl -X PATCH http://localhost:3000/api/turnos/1/doctor \\
 *   -H "Content-Type: application/json" \\
 *   -d '{ "nuevoDoctoId": 2 }'
 * 
 * # Registrar doctor
 * curl -X POST http://localhost:3000/api/doctores \\
 *   -H "Content-Type: application/json" \\
 *   -d '{
 *     "nombre": "Dr. Carlos López",
 *     "email": "carlos@clinica.com",
 *     "especialidadId": 1,
 *     "numeroLicencia": "654321",
 *     "passwordHash": "password_hash"
 *   }'
 * 
 * # Registrar paciente
 * curl -X POST http://localhost:3000/api/pacientes \\
 *   -H "Content-Type: application/json" \\
 *   -d '{
 *     "nombre": "Nuevo Paciente",
 *     "email": "nuevo@email.com",
 *     "telefonoContacto": "555-0000",
 *     "passwordHash": "password_hash"
 *   }'
 */
