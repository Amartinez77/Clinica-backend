/**
 * 🔍 SERVICIO DE AUDITORÍA
 * 
 * Propósito: Queries para acceder y analizar auditoría
 * 
 * Uso:
 * ────────────────────────────────────────────────────
 * const audit = await getAuditTrail('turnos', 42);
 * // Ver historial completo del turno 42
 */

import getSequelize from '../config/sequelize.js';

const sequelize = getSequelize();

/**
 * Obtener pista de auditoría (trail) completa de un registro
 * 
 * @param {string} tablaAfectada - Nombre de la tabla (turnos, doctores, etc)
 * @param {number} registroId - ID del registro
 * @returns {Promise<Array>} Historial completo
 * 
 * @example
 * const trail = await getAuditTrail('turnos', 42);
 * // Retorna: [
 * //   { accion: 'INSERT', fecha: '2025-11-17 10:00', usuario: 'Doctor A', ... },
 * //   { accion: 'UPDATE', fecha: '2025-11-17 10:05', usuario: 'Doctor A', ... },
 * //   { accion: 'UPDATE', fecha: '2025-11-17 10:20', usuario: 'Doctor A', ... }
 * // ]
 */
export async function getAuditTrail(tablaAfectada, registroId) {
  try {
    const [audits] = await sequelize.query(
      `
      SELECT 
        a.id,
        a.tabla_afectada,
        a.accion,
        a.registro_id,
        a.datos_anteriores,
        a.datos_nuevos,
        a.fecha,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        u.tipo as usuario_tipo
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tabla_afectada = ? 
        AND a.registro_id = ?
      ORDER BY a.fecha ASC
      `,
      { replacements: [tablaAfectada, registroId] }
    );

    return audits;
  } catch (error) {
    console.error('❌ Error obteniendo audit trail:', error);
    return [];
  }
}

/**
 * Obtener cambios recientes en una tabla
 * 
 * @param {string} tablaAfectada - Tabla a auditar
 * @param {number} limit - Cantidad de registros (default 50)
 * @returns {Promise<Array>}
 */
export async function getRecentAudits(tablaAfectada, limit = 50) {
  try {
    const [audits] = await sequelize.query(
      `
      SELECT 
        a.id,
        a.tabla_afectada,
        a.accion,
        a.registro_id,
        a.fecha,
        u.nombre as usuario_nombre,
        SUBSTR(a.datos_nuevos, 1, 100) as resumen
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tabla_afectada = ?
      ORDER BY a.fecha DESC
      LIMIT ?
      `,
      { replacements: [tablaAfectada, limit] }
    );

    return audits;
  } catch (error) {
    console.error('❌ Error obteniendo auditoría reciente:', error);
    return [];
  }
}

/**
 * Ver exactamente qué cambió en un UPDATE
 * 
 * @param {string} tablaAfectada - Tabla
 * @param {number} registroId - ID del registro
 * @param {number} auditId - ID de la auditoría (si quieres uno específico)
 * @returns {Promise<Array>} Cambios detallados
 */
export async function getChanges(tablaAfectada, registroId, auditId = null) {
  try {
    let query = `
      SELECT 
        a.id,
        a.accion,
        a.fecha,
        u.nombre as usuario,
        a.datos_anteriores,
        a.datos_nuevos
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tabla_afectada = ? 
        AND a.registro_id = ?
        AND a.accion IN ('UPDATE', 'DELETE')
    `;
    
    const params = [tablaAfectada, registroId];
    
    if (auditId) {
      query += ` AND a.id = ?`;
      params.push(auditId);
    }
    
    query += ` ORDER BY a.fecha DESC`;
    
    const [changes] = await sequelize.query(query, { replacements: params });
    
    return changes;
  } catch (error) {
    console.error('❌ Error obteniendo cambios:', error);
    return [];
  }
}

/**
 * Obtener auditoría de un usuario específico
 * 
 * @param {number} usuarioId - ID del usuario
 * @param {number} limit - Cantidad de registros
 * @returns {Promise<Array>}
 */
export async function getAuditByUser(usuarioId, limit = 100) {
  try {
    const [audits] = await sequelize.query(
      `
      SELECT 
        a.id,
        a.tabla_afectada,
        a.accion,
        a.registro_id,
        a.fecha,
        u.nombre as usuario
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.usuario_id = ?
      ORDER BY a.fecha DESC
      LIMIT ?
      `,
      { replacements: [usuarioId, limit] }
    );

    return audits;
  } catch (error) {
    console.error('❌ Error obteniendo auditoría de usuario:', error);
    return [];
  }
}

/**
 * Detectar anomalías (cambios masivos en poco tiempo)
 * 
 * @param {number} threshold - Cantidad de cambios que considera anomalía (default 20)
 * @returns {Promise<Array>} Anomalías detectadas
 */
export async function detectAnomalies(threshold = 20) {
  try {
    const [anomalies] = await sequelize.query(
      `
      SELECT 
        usuario_id,
        u.nombre as usuario,
        tabla_afectada,
        DATE_FORMAT(fecha, '%Y-%m-%d %H:%i') as minuto,
        COUNT(*) as cambios
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE fecha > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY usuario_id, tabla_afectada, minuto
      HAVING cambios > ?
      ORDER BY cambios DESC
      `,
      { replacements: [threshold] }
    );

    return anomalies;
  } catch (error) {
    console.error('❌ Error detectando anomalías:', error);
    return [];
  }
}

/**
 * Estadísticas de auditoría por tabla
 * 
 * @returns {Promise<Array>}
 */
export async function getAuditStats() {
  try {
    const [stats] = await sequelize.query(
      `
      SELECT 
        tabla_afectada,
        accion,
        COUNT(*) as cantidad,
        MIN(fecha) as primera_auditoria,
        MAX(fecha) as ultima_auditoria
      FROM auditoria
      WHERE fecha > DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY tabla_afectada, accion
      ORDER BY tabla_afectada, accion
      `
    );

    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return [];
  }
}

/**
 * Obtener estado anterior de un registro (para recuperación)
 * 
 * @param {string} tablaAfectada - Tabla
 * @param {number} registroId - ID del registro
 * @param {string} fecha - Fecha hasta la cual recuperar
 * @returns {Promise<Object|null>} Estado anterior
 */
export async function getPreviousState(tablaAfectada, registroId, fecha = null) {
  try {
    let query = `
      SELECT a.datos_anteriores, a.datos_nuevos, a.accion, a.fecha
      FROM auditoria a
      WHERE a.tabla_afectada = ? 
        AND a.registro_id = ?
        AND a.accion IN ('UPDATE', 'DELETE')
    `;
    
    const params = [tablaAfectada, registroId];
    
    if (fecha) {
      query += ` AND a.fecha < ?`;
      params.push(fecha);
    }
    
    query += ` ORDER BY a.fecha DESC LIMIT 1`;
    
    const [result] = await sequelize.query(query, { replacements: params });
    
    if (result.length > 0) {
      return {
        estado: JSON.parse(result[0].datos_anteriores),
        accion: result[0].accion,
        fecha: result[0].fecha
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo estado anterior:', error);
    return null;
  }
}

/**
 * Obtener auditoría de un rango de fechas
 * 
 * @param {string} tablaAfectada - Tabla
 * @param {string} fechaInicio - Formato: YYYY-MM-DD
 * @param {string} fechaFin - Formato: YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function getAuditByDateRange(tablaAfectada, fechaInicio, fechaFin) {
  try {
    const [audits] = await sequelize.query(
      `
      SELECT 
        a.id,
        a.tabla_afectada,
        a.accion,
        a.registro_id,
        a.fecha,
        u.nombre as usuario
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.tabla_afectada = ?
        AND DATE(a.fecha) BETWEEN ? AND ?
      ORDER BY a.fecha DESC
      `,
      { replacements: [tablaAfectada, fechaInicio, fechaFin] }
    );

    return audits;
  } catch (error) {
    console.error('❌ Error obteniendo auditoría por rango:', error);
    return [];
  }
}

/**
 * Resumen de cambios de un turno (caso de uso clínico)
 * 
 * @param {number} turnoId - ID del turno
 * @returns {Promise<Object>} Resumen completo
 */
export async function getTurnoAuditSummary(turnoId) {
  try {
    const trail = await getAuditTrail('turnos', turnoId);
    
    const summary = {
      turnoId,
      historialCompleto: trail,
      estadoCambios: [],
      totalCambios: trail.length,
      creado: null,
      ultimoUpdate: null,
      fue_cancelado: false
    };
    
    for (const audit of trail) {
      if (audit.accion === 'INSERT') {
        summary.creado = {
          fecha: audit.fecha,
          usuario: audit.usuario_nombre,
          estado: JSON.parse(audit.datos_nuevos).estado
        };
      }
      
      if (audit.accion === 'UPDATE') {
        const anterior = JSON.parse(audit.datos_anteriores).estado;
        const nuevo = JSON.parse(audit.datos_nuevos).estado;
        
        summary.estadoCambios.push({
          de: anterior,
          a: nuevo,
          fecha: audit.fecha,
          usuario: audit.usuario_nombre
        });
        
        summary.ultimoUpdate = audit.fecha;
        
        if (nuevo === 'cancelado') {
          summary.fue_cancelado = true;
        }
      }
    }
    
    return summary;
  } catch (error) {
    console.error('❌ Error obteniendo resumen de turno:', error);
    return null;
  }
}

export default {
  getAuditTrail,
  getRecentAudits,
  getChanges,
  getAuditByUser,
  detectAnomalies,
  getAuditStats,
  getPreviousState,
  getAuditByDateRange,
  getTurnoAuditSummary
};
