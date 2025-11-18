/**
 * 🔍 RUTAS DE AUDITORÍA
 * 
 * Endpoints para acceder y analizar auditoría
 */

import express from 'express';
import {
  getAuditTrail,
  getRecentAudits,
  getChanges,
  getAuditByUser,
  detectAnomalies,
  getAuditStats,
  getPreviousState,
  getAuditByDateRange,
  getTurnoAuditSummary
} from '../services/auditService.js';
import auditValidator from '../services/validateAudit.js';

const router = express.Router();

// ============================================================
// 1. VER HISTORIAL COMPLETO DE UN REGISTRO
// ============================================================

/**
 * GET /api/audit/:tabla/:id
 * 
 * Ver el historial completo (trail) de un registro
 * 
 * @param tabla - turnos, doctores, pacientes, usuarios, especialidades
 * @param id - ID del registro
 * 
 * @example
 * GET /api/audit/turnos/42
 * → Retorna historial completo del turno 42
 */
router.get('/audit/:tabla/:id', async (req, res) => {
  try {
    const { tabla, id } = req.params;
    
    // Validar tabla para evitar inyecciones
    const tablasValidas = ['turnos', 'doctores', 'pacientes', 'usuarios', 'especialidades'];
    if (!tablasValidas.includes(tabla)) {
      return res.status(400).json({
        success: false,
        error: 'Tabla no válida'
      });
    }
    
    const trail = await getAuditTrail(tabla, parseInt(id));
    
    res.json({
      success: true,
      tabla,
      registro_id: id,
      total_cambios: trail.length,
      trail
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 2. VER CAMBIOS RECIENTES DE UNA TABLA
// ============================================================

/**
 * GET /api/audit/recent/:tabla?limit=50
 * 
 * Ver cambios recientes en una tabla
 */
router.get('/audit/recent/:tabla', async (req, res) => {
  try {
    const { tabla } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const tablasValidas = ['turnos', 'doctores', 'pacientes', 'usuarios', 'especialidades'];
    if (!tablasValidas.includes(tabla)) {
      return res.status(400).json({
        success: false,
        error: 'Tabla no válida'
      });
    }
    
    const audits = await getRecentAudits(tabla, limit);
    
    res.json({
      success: true,
      tabla,
      cantidad: audits.length,
      audits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 3. VER CAMBIOS ESPECÍFICOS (UPDATEs y DELETEs)
// ============================================================

/**
 * GET /api/audit/changes/:tabla/:id
 * 
 * Ver qué cambió exactamente (UPDATE y DELETE)
 */
router.get('/audit/changes/:tabla/:id', async (req, res) => {
  try {
    const { tabla, id } = req.params;
    
    const changes = await getChanges(tabla, parseInt(id));
    
    res.json({
      success: true,
      tabla,
      registro_id: id,
      cambios: changes.map(c => ({
        accion: c.accion,
        usuario: c.usuario,
        fecha: c.fecha,
        antes: c.datos_anteriores ? JSON.parse(c.datos_anteriores) : null,
        despues: c.datos_nuevos ? JSON.parse(c.datos_nuevos) : null
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 4. VER AUDITORÍA DE UN USUARIO
// ============================================================

/**
 * GET /api/audit/usuario/:id?limit=100
 * 
 * Ver todas las acciones de un usuario
 */
router.get('/audit/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const audits = await getAuditByUser(parseInt(id), limit);
    
    res.json({
      success: true,
      usuario_id: id,
      cantidad: audits.length,
      audits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 5. DETECTAR ANOMALÍAS
// ============================================================

/**
 * GET /api/audit/anomalies?threshold=20
 * 
 * Detectar cambios masivos en poco tiempo
 * Útil para detectar comportamiento sospechoso
 */
router.get('/audit/anomalies', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 20;
    
    const anomalies = await detectAnomalies(threshold);
    
    res.json({
      success: true,
      threshold,
      anomalias: anomalies,
      total: anomalies.length,
      mensaje: anomalies.length > 0 
        ? '⚠️ Se detectaron cambios masivos'
        : '✅ Sin anomalías detectadas'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 6. ESTADÍSTICAS DE AUDITORÍA
// ============================================================

/**
 * GET /api/audit/stats
 * 
 * Ver estadísticas de auditoría últimos 7 días
 */
router.get('/audit/stats', async (req, res) => {
  try {
    const stats = await getAuditStats();
    
    // Agrupar por tabla
    const porTabla = {};
    for (const stat of stats) {
      if (!porTabla[stat.tabla_afectada]) {
        porTabla[stat.tabla_afectada] = {};
      }
      porTabla[stat.tabla_afectada][stat.accion] = stat.cantidad;
    }
    
    res.json({
      success: true,
      periodo: 'Últimos 7 días',
      por_tabla: porTabla,
      total_cambios: stats.reduce((sum, s) => sum + s.cantidad, 0),
      detalles: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 7. OBTENER ESTADO ANTERIOR (RECUPERACIÓN)
// ============================================================

/**
 * GET /api/audit/previous/:tabla/:id?fecha=2025-11-17
 * 
 * Obtener el estado anterior de un registro
 * Útil para recuperación de datos
 */
router.get('/audit/previous/:tabla/:id', async (req, res) => {
  try {
    const { tabla, id } = req.params;
    const fecha = req.query.fecha || null;
    
    const previousState = await getPreviousState(tabla, parseInt(id), fecha);
    
    if (previousState) {
      res.json({
        success: true,
        tabla,
        registro_id: id,
        estado_anterior: previousState.estado,
        accion_realizada: previousState.accion,
        fecha_cambio: previousState.fecha
      });
    } else {
      res.json({
        success: false,
        mensaje: 'No hay historial anterior disponible',
        tabla,
        registro_id: id
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 8. AUDITORÍA POR RANGO DE FECHAS
// ============================================================

/**
 * GET /api/audit/range/:tabla?desde=2025-11-10&hasta=2025-11-17
 * 
 * Ver cambios en un rango de fechas
 */
router.get('/audit/range/:tabla', async (req, res) => {
  try {
    const { tabla } = req.params;
    const { desde, hasta } = req.query;
    
    if (!desde || !hasta) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros requeridos: desde, hasta (formato YYYY-MM-DD)'
      });
    }
    
    const audits = await getAuditByDateRange(tabla, desde, hasta);
    
    res.json({
      success: true,
      tabla,
      rango: { desde, hasta },
      cantidad: audits.length,
      audits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 9. RESUMEN DE AUDITORÍA DE UN TURNO (CLÍNICO)
// ============================================================

/**
 * GET /api/audit/turno/:id
 * 
 * Resumen específico para turnos
 * Muestra: creación, estado cambios, cancelación, etc.
 */
router.get('/audit/turno/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const summary = await getTurnoAuditSummary(parseInt(id));
    
    if (summary) {
      res.json({
        success: true,
        turno_id: id,
        summary
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Turno no encontrado en auditoría'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 10. DASHBOARD GENERAL DE AUDITORÍA
// ============================================================

/**
 * GET /api/audit/dashboard
 * 
 * Dashboard con información general de auditoría
 */
router.get('/audit/dashboard', async (req, res) => {
  try {
    const stats = await getAuditStats();
    const anomalies = await detectAnomalies(20);
    
    res.json({
      success: true,
      resumen: {
        total_cambios_ultimos_7_dias: stats.reduce((sum, s) => sum + s.cantidad, 0),
        anomalias_detectadas: anomalies.length,
        tablas_auditadas: [...new Set(stats.map(s => s.tabla_afectada))],
        ultima_actualizacion: new Date()
      },
      estadisticas: stats,
      anomalias: anomalies,
      alertas: anomalies.length > 0 
        ? '⚠️ Se detectaron patrones anormales'
        : '✅ Sistema normal'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// 11. VALIDAR SISTEMA DE AUDITORÍA
// ============================================================

/**
 * GET /api/audit/validate
 * 
 * Validar que el sistema de auditoría está correctamente instalado
 * Verificar: tabla, triggers, índices, datos, usuarios
 */
router.get('/audit/validate', async (req, res) => {
  try {
    const resultados = await auditValidator.validarTodo();
    
    const todoOk = Object.values(resultados).every(r => r.success !== false);
    
    res.json({
      success: todoOk,
      status: todoOk ? '✅ Sistema funcional' : '❌ Problemas detectados',
      resultados
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

/**
 * RESUMEN DE ENDPOINTS
 * 
 * GET /api/audit/:tabla/:id                    - Historial completo
 * GET /api/audit/recent/:tabla?limit=50        - Cambios recientes
 * GET /api/audit/changes/:tabla/:id             - UPDATEs y DELETEs
 * GET /api/audit/usuario/:id?limit=100         - Acciones de usuario
 * GET /api/audit/anomalies?threshold=20        - Detectar anomalías
 * GET /api/audit/stats                         - Estadísticas
 * GET /api/audit/previous/:tabla/:id?fecha=... - Estado anterior
 * GET /api/audit/range/:tabla?desde=...&hasta= - Por rango de fechas
 * GET /api/audit/turno/:id                     - Resumen de turno
 * GET /api/audit/dashboard                     - Dashboard general
 * GET /api/audit/validate                      - Validar sistema
 * 
 * TESTING CON CURL:
 * ═══════════════════════════════════════════════════════════════
 * 
 * # Ver historial de turno 42
 * curl http://localhost:3000/api/audit/turnos/42
 * 
 * # Ver cambios recientes en turnos
 * curl http://localhost:3000/api/audit/recent/turnos?limit=20
 * 
 * # Ver anomalías
 * curl http://localhost:3000/api/audit/anomalies
 * 
 * # Ver estadísticas
 * curl http://localhost:3000/api/audit/stats
 * 
 * # Resumen de turno específico
 * curl http://localhost:3000/api/audit/turno/42
 * 
 * # Dashboard
 * curl http://localhost:3000/api/audit/dashboard
 * 
 * # Validar sistema
 * curl http://localhost:3000/api/audit/validate
 */
