/**
 * 🔍 VALIDAR SISTEMA DE AUDITORÍA
 * 
 * Script para verificar que todo está correctamente instalado
 */

import getSequelize from '../config/sequelize.js';

const sequelize = getSequelize();

/**
 * Validar que la tabla auditoria existe y está correcta
 */
export async function validarTablaAuditoria() {
  console.log('\n✅ VALIDANDO TABLA AUDITORÍA...');
  
  try {
    // 1. Verificar tabla existe
    const tableExists = await sequelize.query(`
      SELECT COUNT(*) as existe FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'auditoria'
    `);
    
    if (tableExists[0][0].existe === 0) {
      return { success: false, error: 'Tabla auditoria no existe' };
    }
    console.log('  ✓ Tabla auditoria existe');
    
    // 2. Verificar estructura
    const columns = await sequelize.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'auditoria' 
      ORDER BY ORDINAL_POSITION
    `);
    
    const columnNames = columns[0].map(c => c.COLUMN_NAME);
    const required = ['id', 'tabla_afectada', 'accion', 'registro_id', 'datos_anteriores', 'datos_nuevos', 'usuario_id', 'fecha'];
    
    const missing = required.filter(col => !columnNames.includes(col));
    
    if (missing.length > 0) {
      return { success: false, error: `Columnas faltantes: ${missing.join(', ')}` };
    }
    console.log('  ✓ Estructura correcta');
    console.log(`    Columnas: ${columnNames.join(', ')}`);
    
    // 3. Contar registros
    const count = await sequelize.query('SELECT COUNT(*) as total FROM auditoria');
    console.log(`  ✓ Total registros de auditoría: ${count[0][0].total}`);
    
    // 4. Verificar últimos registros
    const recent = await sequelize.query(`
      SELECT id, tabla_afectada, accion, usuario_id, fecha
      FROM auditoria
      ORDER BY fecha DESC
      LIMIT 3
    `);
    
    if (recent[0].length > 0) {
      console.log('  ✓ Últimos registros capturados:');
      recent[0].forEach(r => {
        console.log(`    [${r.id}] ${r.tabla_afectada}.${r.accion} por usuario ${r.usuario_id} - ${r.fecha}`);
      });
    } else {
      console.log('  ⚠ No hay registros de auditoría aún');
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validar que los triggers existen
 */
export async function validarTriggers() {
  console.log('\n✅ VALIDANDO TRIGGERS...');
  
  try {
    const triggers = await sequelize.query(`
      SELECT TRIGGER_NAME, TRIGGER_SCHEMA, EVENT_MANIPULATION, EVENT_OBJECT_TABLE
      FROM information_schema.TRIGGERS
      WHERE TRIGGER_SCHEMA = DATABASE()
      AND TRIGGER_NAME LIKE 'audit_%'
      ORDER BY EVENT_OBJECT_TABLE, EVENT_MANIPULATION
    `);
    
    if (triggers[0].length === 0) {
      return { success: false, error: 'No hay triggers de auditoría instalados' };
    }
    
    console.log(`  ✓ Total triggers: ${triggers[0].length}`);
    
    // Agrupar por tabla
    const porTabla = {};
    triggers[0].forEach(t => {
      const tabla = t.EVENT_OBJECT_TABLE;
      if (!porTabla[tabla]) porTabla[tabla] = [];
      porTabla[tabla].push(t.EVENT_MANIPULATION);
    });
    
    Object.entries(porTabla).forEach(([tabla, acciones]) => {
      console.log(`  ✓ ${tabla}: ${acciones.join(', ')}`);
    });
    
    return { success: true, triggers: triggers[0].length };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validar que hay datos siendo auditados
 */
export async function validarDatosAuditados() {
  console.log('\n✅ VALIDANDO DATOS AUDITADOS...');
  
  try {
    const stats = await sequelize.query(`
      SELECT tabla_afectada, accion, COUNT(*) as cantidad
      FROM auditoria
      GROUP BY tabla_afectada, accion
      ORDER BY tabla_afectada, accion
    `);
    
    if (stats[0].length === 0) {
      console.log('  ⚠ No hay datos auditados aún');
      return { success: true, warning: 'Sin datos' };
    }
    
    console.log('  ✓ Auditoría por tabla y acción:');
    stats[0].forEach(s => {
      console.log(`    ${s.tabla_afectada}.${s.accion}: ${s.cantidad}`);
    });
    
    return { success: true, stats: stats[0] };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validar que hay índices para performance
 */
export async function validarIndices() {
  console.log('\n✅ VALIDANDO ÍNDICES...');
  
  try {
    const indices = await sequelize.query(`
      SELECT INDEX_NAME, COLUMN_NAME
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'auditoria'
      AND INDEX_NAME != 'PRIMARY'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);
    
    if (indices[0].length === 0) {
      console.log('  ⚠ No hay índices adicionales');
      return { success: true, warning: 'Sin índices adicionales' };
    }
    
    console.log(`  ✓ Total índices: ${new Set(indices[0].map(i => i.INDEX_NAME)).size}`);
    
    const porIndice = {};
    indices[0].forEach(i => {
      if (!porIndice[i.INDEX_NAME]) porIndice[i.INDEX_NAME] = [];
      porIndice[i.INDEX_NAME].push(i.COLUMN_NAME);
    });
    
    Object.entries(porIndice).forEach(([nombre, columnas]) => {
      console.log(`  ✓ ${nombre}: (${columnas.join(', ')})`);
    });
    
    return { success: true, indices: Object.keys(porIndice).length };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validar que los usuarios están siendo capturados
 */
export async function validarUsuariosCapturados() {
  console.log('\n✅ VALIDANDO CAPTURA DE USUARIOS...');
  
  try {
    const usuarios = await sequelize.query(`
      SELECT usuario_id, COUNT(*) as cantidad, MAX(fecha) as ultimo_cambio
      FROM auditoria
      WHERE usuario_id IS NOT NULL
      GROUP BY usuario_id
      ORDER BY cantidad DESC
    `);
    
    if (usuarios[0].length === 0) {
      console.log('  ⚠ No hay auditoría con usuario_id (quizás todavía no integrado)');
      return { success: true, warning: 'Sin usuario_id' };
    }
    
    console.log('  ✓ Cambios por usuario:');
    usuarios[0].forEach(u => {
      console.log(`    Usuario ${u.usuario_id}: ${u.cantidad} cambios (último: ${u.ultimo_cambio})`);
    });
    
    return { success: true, usuarios: usuarios[0].length };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validar que JSON se está guardando correctamente
 */
export async function validarJSON() {
  console.log('\n✅ VALIDANDO DATOS JSON...');
  
  try {
    const jsonRecords = await sequelize.query(`
      SELECT id, tabla_afectada, 
             CHAR_LENGTH(datos_anteriores) as bytes_antes,
             CHAR_LENGTH(datos_nuevos) as bytes_despues
      FROM auditoria
      WHERE datos_nuevos IS NOT NULL
      ORDER BY id DESC
      LIMIT 5
    `);
    
    if (jsonRecords[0].length === 0) {
      console.log('  ⚠ No hay registros con JSON');
      return { success: true, warning: 'Sin JSON' };
    }
    
    console.log('  ✓ Últimos datos JSON capturados:');
    jsonRecords[0].forEach(r => {
      const total = (r.bytes_antes || 0) + (r.bytes_despues || 0);
      console.log(`    [${r.id}] ${r.tabla_afectada}: ${total} bytes`);
    });
    
    return { success: true, records: jsonRecords[0].length };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Ejecutar todas las validaciones
 */
export async function validarTodo() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🔍 VALIDACIÓN COMPLETA DE AUDITORÍA                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const resultados = {};
  
  // 1. Tabla
  resultados.tabla = await validarTablaAuditoria();
  
  // 2. Triggers
  resultados.triggers = await validarTriggers();
  
  // 3. Índices
  resultados.indices = await validarIndices();
  
  // 4. Datos
  resultados.datos = await validarDatosAuditados();
  
  // 5. Usuarios
  resultados.usuarios = await validarUsuariosCapturados();
  
  // 6. JSON
  resultados.json = await validarJSON();
  
  // Resumen
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                          RESUMEN                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const todoOk = Object.values(resultados).every(r => r.success !== false);
  
  if (todoOk) {
    console.log('\n✅ SISTEMA DE AUDITORÍA COMPLETAMENTE FUNCIONAL\n');
  } else {
    console.log('\n❌ PROBLEMAS DETECTADOS - VER ARRIBA\n');
    const problemas = Object.entries(resultados)
      .filter(([, r]) => !r.success)
      .map(([nombre, r]) => `${nombre}: ${r.error}`);
    
    problemas.forEach(p => console.log(`  ❌ ${p}`));
  }
  
  return resultados;
}

// Exportar función principal
export default {
  validarTablaAuditoria,
  validarTriggers,
  validarDatosAuditados,
  validarIndices,
  validarUsuariosCapturados,
  validarJSON,
  validarTodo
};

/**
 * CÓMO USAR:
 * 
 * 1. En Node.js:
 *    import auditValidator from './validateAudit.js';
 *    await auditValidator.validarTodo();
 * 
 * 2. Como endpoint (agregar a auditRoutes.js):
 *    GET /api/audit/validate
 * 
 * 3. En CLI:
 *    node -e "
 *      import('./src/services/validateAudit.js')
 *        .then(m => m.validarTodo())
 *        .then(() => process.exit(0))
 *    "
 */
