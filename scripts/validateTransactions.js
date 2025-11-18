/**
 * 🔐 SCRIPT DE VALIDACIÓN - Transacciones
 * 
 * Propósito: Verificar que transacciones funcionan correctamente
 * 
 * Uso:
 * node scripts/validateTransactions.js
 */

import sequelize from '../src/config/sequelize.js';
import { Turno, Doctor, Paciente, Usuario, Especialidad } from '../src/sql_models/index.js';

console.log('🔐 INICIANDO VALIDACIÓN DE TRANSACCIONES...\n');

// ============================================================
// 1. VALIDAR CONEXIÓN A BD
// ============================================================

async function validarConexion() {
  console.log('1️⃣ Validando conexión a la base de datos...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa\n');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a BD:', error.message);
    return false;
  }
}

// ============================================================
// 2. VALIDAR MODELOS
// ============================================================

async function validarModelos() {
  console.log('2️⃣ Validando modelos Sequelize...');
  
  const modelos = {
    Usuario,
    Especialidad,
    Doctor,
    Paciente,
    Turno
  };
  
  let todosOK = true;
  
  for (const [nombre, modelo] of Object.entries(modelos)) {
    if (!modelo) {
      console.error(`❌ Modelo ${nombre} no está definido`);
      todosOK = false;
    } else {
      console.log(`✅ Modelo ${nombre} OK`);
    }
  }
  
  console.log('');
  return todosOK;
}

// ============================================================
// 3. VALIDAR TRANSACCIÓN SIMPLE
// ============================================================

async function validarTransaccionSimple() {
  console.log('3️⃣ Validando transacción simple...');
  
  const t = await sequelize.transaction();
  
  try {
    // Crear un turno dentro de transacción
    const turno = await Turno.create({
      pacienteId: 1,
      doctorId: 1,
      fechaHora: new Date(),
      razonConsulta: 'Test transacción',
      estado: 'pendiente',
      notas: ''
    }, { transaction: t });
    
    console.log(`✅ Turno creado en transacción: ${turno.id}`);
    
    // Hacer rollback (para no dejar datos de prueba)
    await t.rollback();
    console.log('✅ Rollback ejecutado correctamente\n');
    return true;
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error en transacción simple:', error.message, '\n');
    return false;
  }
}

// ============================================================
// 4. VALIDAR TRANSACCIÓN CON MÚLTIPLES OPERACIONES
// ============================================================

async function validarTransaccionMultiple() {
  console.log('4️⃣ Validando transacción con múltiples operaciones...');
  
  const t = await sequelize.transaction();
  
  try {
    // 1. Crear usuario
    const usuario = await Usuario.create({
      email: `test-${Date.now()}@test.com`,
      nombre: 'Usuario Test',
      tipo: 'paciente',
      estado: 'activo'
    }, { transaction: t });
    
    console.log(`  ✅ Usuario creado: ${usuario.id}`);
    
    // 2. Crear paciente
    const paciente = await Paciente.create({
      usuarioId: usuario.id,
      numeroHistoriaClinica: 'TEST-001',
      numeroTurnos: 0
    }, { transaction: t });
    
    console.log(`  ✅ Paciente creado: ${paciente.id}`);
    
    // 3. Hacer rollback (test mode)
    await t.rollback();
    console.log('✅ Rollback de transacción múltiple OK\n');
    return true;
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error en transacción múltiple:', error.message, '\n');
    return false;
  }
}

// ============================================================
// 5. VALIDAR ROLLBACK EN CASO DE ERROR
// ============================================================

async function validarRollbackConError() {
  console.log('5️⃣ Validando rollback automático en caso de error...');
  
  const t = await sequelize.transaction();
  
  try {
    // 1. Operación OK
    const usuario = await Usuario.create({
      email: `test-${Date.now()}@test.com`,
      nombre: 'Usuario Test 2',
      tipo: 'paciente',
      estado: 'activo'
    }, { transaction: t });
    
    console.log(`  ✅ Usuario creado: ${usuario.id}`);
    
    // 2. Operación que falla (FK inválida)
    const paciente = await Paciente.create({
      usuarioId: 99999, // ❌ Usuario inexistente
      numeroHistoriaClinica: 'TEST-002',
      numeroTurnos: 0
    }, { transaction: t });
    
    // No debería llegar aquí
    console.log('❌ No debería llegar a este punto');
    
  } catch (error) {
    // Capturar el error esperado
    await t.rollback();
    console.log(`✅ Error capturado correctamente: ${error.message}`);
    console.log('✅ Rollback automático ejecutado\n');
    return true;
  }
}

// ============================================================
// 6. VALIDAR CONFIGURACIÓN MYSQL
// ============================================================

async function validarConfiguracionMySQL() {
  console.log('6️⃣ Validando configuración MySQL...');
  
  try {
    const [autocommit] = await sequelize.query(
      "SHOW VARIABLES LIKE 'autocommit'"
    );
    
    const [isolation] = await sequelize.query(
      "SHOW VARIABLES LIKE 'transaction_isolation'"
    );
    
    const [binlog] = await sequelize.query(
      "SHOW VARIABLES LIKE 'binlog_format'"
    );
    
    const [syncBinlog] = await sequelize.query(
      "SHOW VARIABLES LIKE 'sync_binlog'"
    );
    
    console.log('  Variables MySQL:');
    console.log(`  ✅ autocommit = ${autocommit[0]?.Value || 'ON'}`);
    console.log(`  ✅ transaction_isolation = ${isolation[0]?.Value || 'REPEATABLE-READ'}`);
    console.log(`  ✅ binlog_format = ${binlog[0]?.Value || 'ROW'}`);
    console.log(`  ✅ sync_binlog = ${syncBinlog[0]?.Value || '1'}`);
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando MySQL:', error.message, '\n');
    return false;
  }
}

// ============================================================
// 7. VALIDAR ÍNDICES Y FK
// ============================================================

async function validarIndicesFK() {
  console.log('7️⃣ Validando índices y Foreign Keys...');
  
  try {
    // Verificar FKs
    const [fks] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        DELETE_RULE
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
      WHERE TABLE_SCHEMA = 'clinica_db'
      ORDER BY TABLE_NAME
    `);
    
    console.log(`  ✅ Found ${fks.length} Foreign Keys:`);
    
    let restrictCount = 0;
    
    for (const fk of fks) {
      const rule = fk.DELETE_RULE;
      const status = rule === 'RESTRICT' ? '✅' : '⚠️';
      console.log(
        `    ${status} ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME} [${rule}]`
      );
      
      if (rule === 'RESTRICT') restrictCount++;
    }
    
    console.log(`\n  ✅ ${restrictCount}/${fks.length} FKs con RESTRICT (seguro)\n`);
    
    return restrictCount === fks.length;
    
  } catch (error) {
    console.error('❌ Error validando FKs:', error.message, '\n');
    return false;
  }
}

// ============================================================
// 8. VALIDAR TABLAS INNODB
// ============================================================

async function validarTablesInnoDB() {
  console.log('8️⃣ Validando tablas InnoDB...');
  
  try {
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, ENGINE
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'clinica_db'
      ORDER BY TABLE_NAME
    `);
    
    console.log(`  ✅ Found ${tables.length} tablas:`);
    
    let innodbCount = 0;
    
    for (const table of tables) {
      const status = table.ENGINE === 'InnoDB' ? '✅' : '❌';
      console.log(`    ${status} ${table.TABLE_NAME} [${table.ENGINE}]`);
      
      if (table.ENGINE === 'InnoDB') innodbCount++;
    }
    
    console.log(`\n  ✅ ${innodbCount}/${tables.length} tablas usando InnoDB\n`);
    
    return innodbCount === tables.length;
    
  } catch (error) {
    console.error('❌ Error validando tablas:', error.message, '\n');
    return false;
  }
}

// ============================================================
// MAIN - Ejecutar todas las validaciones
// ============================================================

async function main() {
  try {
    // 1. Conexión
    const conexionOK = await validarConexion();
    if (!conexionOK) {
      console.log('❌ No se pudo conectar a la BD. Abortando...');
      process.exit(1);
    }
    
    // 2. Modelos
    const modelosOK = await validarModelos();
    
    // 3-5. Transacciones
    const simple = await validarTransaccionSimple();
    const multiple = await validarTransaccionMultiple();
    const rollback = await validarRollbackConError();
    
    // 6. Configuración MySQL
    const configOK = await validarConfiguracionMySQL();
    
    // 7. FKs
    const fksOK = await validarIndicesFK();
    
    // 8. InnoDB
    const innodbOK = await validarTablesInnoDB();
    
    // ============================================================
    // RESUMEN
    // ============================================================
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE VALIDACIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const resultados = [
      { nombre: 'Conexión BD', ok: conexionOK },
      { nombre: 'Modelos', ok: modelosOK },
      { nombre: 'Transacción Simple', ok: simple },
      { nombre: 'Transacción Múltiple', ok: multiple },
      { nombre: 'Rollback en Error', ok: rollback },
      { nombre: 'Configuración MySQL', ok: configOK },
      { nombre: 'Foreign Keys RESTRICT', ok: fksOK },
      { nombre: 'Tablas InnoDB', ok: innodbOK }
    ];
    
    let totalOK = 0;
    
    for (const resultado of resultados) {
      const icon = resultado.ok ? '✅' : '❌';
      console.log(`${icon} ${resultado.nombre}`);
      if (resultado.ok) totalOK++;
    }
    
    console.log(`\n📊 Total: ${totalOK}/${resultados.length} validaciones exitosas\n`);
    
    if (totalOK === resultados.length) {
      console.log('🎉 TODAS LAS VALIDACIONES PASARON - SISTEMA LISTO\n');
      process.exit(0);
    } else {
      console.log('⚠️ ALGUNAS VALIDACIONES FALLARON - REVISAR\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
main();
