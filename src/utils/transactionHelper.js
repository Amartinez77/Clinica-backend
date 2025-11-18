/**
 * 🔐 TRANSACTION HELPERS - Sequelize
 * 
 * Simplifica el manejo de transacciones en operaciones multi-statement
 * 
 * Uso:
 * ────────────────────────────────────────────────────
 * const result = await withTransaction(async (t) => {
 *   // tus operaciones aquí
 *   await Model.create({...}, { transaction: t });
 *   return data;
 * });
 */

import sequelize from '../config/sequelize.js';

/**
 * Ejecuta un callback dentro de una transacción
 * 
 * @param {Function} callback - Función que ejecutar dentro de transacción
 * @returns {Promise<Object>} { success: bool, data?: any, error?: string }
 * 
 * @example
 * const { success, data, error } = await withTransaction(async (t) => {
 *   const turno = await Turno.create({...}, { transaction: t });
 *   await Paciente.update({...}, { where: {...}, transaction: t });
 *   return turno;
 * });
 */
export async function withTransaction(callback) {
  const t = await sequelize.transaction();
  
  try {
    // Ejecutar operaciones dentro de transacción
    const result = await callback(t);
    
    // Si todo OK, hacer commit
    await t.commit();
    
    return {
      success: true,
      data: result,
      error: null
    };
  } catch (error) {
    // Si hay error, hacer rollback automático
    await t.rollback();
    
    console.error('❌ Transaction Rollback:', error.message);
    
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Variante que lanza error (para async/await sin objeto de respuesta)
 * 
 * @param {Function} callback - Función que ejecutar dentro de transacción
 * @returns {Promise<any>} Resultado del callback
 * 
 * @example
 * try {
 *   const turno = await withTransactionThrow(async (t) => {
 *     const turno = await Turno.create({...}, { transaction: t });
 *     await Paciente.update({...}, { where: {...}, transaction: t });
 *     return turno;
 *   });
 * } catch (error) {
 *   // Manejar error
 * }
 */
export async function withTransactionThrow(callback) {
  const t = await sequelize.transaction();
  
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

/**
 * Ejecuta múltiples callbacks secuencialmente en la MISMA transacción
 * (útil cuando tienes lógica en múltiples funciones)
 * 
 * @param {Array<Function>} callbacks - Array de funciones a ejecutar
 * @returns {Promise<Array>} Array de resultados
 * 
 * @example
 * const [user, doctor] = await withMultipleOperations([
 *   (t) => Usuario.create({...}, { transaction: t }),
 *   (t) => Doctor.create({...}, { transaction: t })
 * ]);
 */
export async function withMultipleOperations(callbacks) {
  const t = await sequelize.transaction();
  
  try {
    const results = [];
    
    for (const callback of callbacks) {
      const result = await callback(t);
      results.push(result);
    }
    
    await t.commit();
    
    return {
      success: true,
      data: results,
      error: null
    };
  } catch (error) {
    await t.rollback();
    
    console.error('❌ Multi-Operation Rollback:', error.message);
    
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Retorna un objeto transacción para control manual
 * (si necesitas control fino sobre commit/rollback)
 * 
 * @returns {Promise<Object>} { transaction: t, commit: fn, rollback: fn }
 * 
 * @example
 * const { transaction: t, commit, rollback } = await getManualTransaction();
 * try {
 *   await Turno.create({...}, { transaction: t });
 *   await commit();
 * } catch (e) {
 *   await rollback();
 * }
 */
export async function getManualTransaction() {
  const t = await sequelize.transaction();
  
  return {
    transaction: t,
    commit: async () => {
      await t.commit();
      console.log('✅ Transaction Committed');
    },
    rollback: async () => {
      await t.rollback();
      console.log('❌ Transaction Rolled Back');
    }
  };
}

export default {
  withTransaction,
  withTransactionThrow,
  withMultipleOperations,
  getManualTransaction
};
