/**
 * 🔐 SERVICIOS CON TRANSACCIONES
 * 
 * Ejemplos de operaciones críticas implementadas con transacciones Sequelize
 * 
 * OPERACIONES CRÍTICAS QUE NECESITAN TRANSACCIÓN:
 * ─────────────────────────────────────────────────────
 * 1. Agendar turno (crear turno + actualizar doctor/paciente)
 * 2. Cancelar turno (delete turno + revertir contadores)
 * 3. Registrar doctor (crear usuario + crear doctor + especialidad)
 * 4. Registrar paciente (crear usuario + crear paciente)
 */

import getSequelize from '../config/sequelize.js';

const sequelize = getSequelize();
import { Turno } from '../sql_models/index.js';
import { Doctor } from '../sql_models/index.js';
import { Paciente } from '../sql_models/index.js';
import { Usuario } from '../sql_models/index.js';
import { Especialidad } from '../sql_models/index.js';

// ============================================================
// 1. AGENDAR TURNO - Operación crítica multi-tabla
// ============================================================

/**
 * Agenda un nuevo turno de forma segura con transacción
 * 
 * Operaciones:
 * - INSERT nuevo turno
 * - UPDATE doctor (última consulta)
 * - UPDATE paciente (número de turnos)
 * 
 * @param {Object} turnoData - { pacienteId, doctorId, fechaHora, razonConsulta }
 * @returns {Promise<Object>} { success, turno?, error? }
 */
export async function agendarTurno(turnoData) {
  const t = await sequelize.transaction();
  
  try {
    console.log('📅 Agendando turno:', turnoData);
    
    // 1. Validar que paciente y doctor existan
    const paciente = await Paciente.findByPk(turnoData.pacienteId, { transaction: t });
    const doctor = await Doctor.findByPk(turnoData.doctorId, { transaction: t });
    
    if (!paciente) throw new Error(`Paciente ${turnoData.pacienteId} no existe`);
    if (!doctor) throw new Error(`Doctor ${turnoData.doctorId} no existe`);
    
    // 2. Verificar disponibilidad del doctor en esa hora
    const turnoExistente = await Turno.findOne({
      where: {
        doctorId: turnoData.doctorId,
        fechaHora: turnoData.fechaHora,
        estado: ['pendiente', 'confirmado']
      },
      transaction: t
    });
    
    if (turnoExistente) {
      throw new Error('Doctor no disponible en ese horario');
    }
    
    // 3. CREAR TURNO (operación 1)
    const turno = await Turno.create({
      pacienteId: turnoData.pacienteId,
      doctorId: turnoData.doctorId,
      fechaHora: turnoData.fechaHora,
      razonConsulta: turnoData.razonConsulta || '',
      estado: 'pendiente',
      notas: ''
    }, { transaction: t });
    
    console.log('✅ Turno creado:', turno.id);
    
    // 4. ACTUALIZAR DOCTOR (operación 2)
    await Doctor.update(
      {
        ultimaConsulta: new Date(),
        proximaDisponibilidad: new Date(turnoData.fechaHora)
      },
      {
        where: { id: turnoData.doctorId },
        transaction: t
      }
    );
    
    console.log('✅ Doctor actualizado');
    
    // 5. ACTUALIZAR PACIENTE (operación 3)
    await Paciente.update(
      {
        numeroTurnos: sequelize.literal('numeroTurnos + 1'),
        ultimaConsulta: new Date()
      },
      {
        where: { id: turnoData.pacienteId },
        transaction: t
      }
    );
    
    console.log('✅ Paciente actualizado');
    
    // COMMIT - Si llegamos aquí, todo OK
    await t.commit();
    
    return {
      success: true,
      turno,
      message: `Turno ${turno.id} agendado exitosamente`
    };
    
  } catch (error) {
    // ROLLBACK - Si hay error, deshacer TODO
    await t.rollback();
    
    console.error('❌ Error al agendar turno:', error.message);
    
    return {
      success: false,
      turno: null,
      error: error.message
    };
  }
}

// ============================================================
// 2. CANCELAR TURNO - Operación crítica multi-tabla
// ============================================================

/**
 * Cancela un turno de forma segura
 * 
 * Operaciones:
 * - UPDATE turno (estado = cancelado)
 * - UPDATE paciente (decrementar contadores)
 * - UPDATE doctor (recalcular disponibilidad)
 * 
 * @param {Number} turnoId - ID del turno a cancelar
 * @param {String} motivo - Razón de la cancelación
 * @returns {Promise<Object>} { success, turno?, error? }
 */
export async function cancelarTurno(turnoId, motivo = '') {
  const t = await sequelize.transaction();
  
  try {
    console.log('🚫 Cancelando turno:', turnoId);
    
    // 1. Obtener turno actual
    const turno = await Turno.findByPk(turnoId, { transaction: t });
    
    if (!turno) {
      throw new Error(`Turno ${turnoId} no existe`);
    }
    
    if (turno.estado === 'cancelado') {
      throw new Error(`Turno ${turnoId} ya estaba cancelado`);
    }
    
    // 2. ACTUALIZAR TURNO (operación 1)
    await Turno.update(
      {
        estado: 'cancelado',
        notas: `Cancelado: ${motivo}`,
        canceladoEn: new Date()
      },
      {
        where: { id: turnoId },
        transaction: t
      }
    );
    
    console.log('✅ Turno marcado como cancelado');
    
    // 3. ACTUALIZAR PACIENTE (operación 2)
    await Paciente.update(
      {
        numeroTurnos: sequelize.literal('GREATEST(numeroTurnos - 1, 0)')
      },
      {
        where: { id: turno.pacienteId },
        transaction: t
      }
    );
    
    console.log('✅ Contador de paciente actualizado');
    
    // 4. ACTUALIZAR DOCTOR (operación 3)
    // Recalcular próxima cita disponible
    const proximoTurno = await Turno.findOne({
      where: {
        doctorId: turno.doctorId,
        estado: ['pendiente', 'confirmado']
      },
      order: [['fechaHora', 'ASC']],
      transaction: t
    });
    
    await Doctor.update(
      {
        proximaDisponibilidad: proximoTurno 
          ? new Date(proximoTurno.fechaHora) 
          : null
      },
      {
        where: { id: turno.doctorId },
        transaction: t
      }
    );
    
    console.log('✅ Doctor actualizado');
    
    // COMMIT
    await t.commit();
    
    return {
      success: true,
      turno: { ...turno.dataValues, estado: 'cancelado' },
      message: `Turno ${turnoId} cancelado exitosamente`
    };
    
  } catch (error) {
    await t.rollback();
    
    console.error('❌ Error al cancelar turno:', error.message);
    
    return {
      success: false,
      turno: null,
      error: error.message
    };
  }
}

// ============================================================
// 3. REGISTRAR DOCTOR - Operación crítica multi-tabla
// ============================================================

/**
 * Registra un nuevo doctor de forma segura
 * 
 * Operaciones:
 * - INSERT usuario
 * - INSERT doctor
 * - CREATE relación con especialidad
 * 
 * @param {Object} doctorData - { nombre, email, especialidadId, ... }
 * @returns {Promise<Object>} { success, doctor?, error? }
 */
export async function registrarDoctor(doctorData) {
  const t = await sequelize.transaction();
  
  try {
    console.log('👨‍⚕️ Registrando doctor:', doctorData.nombre);
    
    // 1. Validar que especialidad exista
    if (doctorData.especialidadId) {
      const especialidad = await Especialidad.findByPk(
        doctorData.especialidadId,
        { transaction: t }
      );
      
      if (!especialidad) {
        throw new Error(`Especialidad ${doctorData.especialidadId} no existe`);
      }
    }
    
    // 2. Validar que email no exista
    const usuarioExistente = await Usuario.findOne({
      where: { email: doctorData.email },
      transaction: t
    });
    
    if (usuarioExistente) {
      throw new Error(`Email ${doctorData.email} ya está registrado`);
    }
    
    // 3. CREAR USUARIO (operación 1)
    const usuario = await Usuario.create({
      email: doctorData.email,
      nombre: doctorData.nombre,
      tipo: 'doctor',
      estado: 'activo',
      passwordHash: doctorData.passwordHash || '', // Debe hashearse
      telefonoContacto: doctorData.telefonoContacto || '',
      direccion: doctorData.direccion || ''
    }, { transaction: t });
    
    console.log('✅ Usuario creado:', usuario.id);
    
    // 4. CREAR DOCTOR (operación 2)
    const doctor = await Doctor.create({
      usuarioId: usuario.id,
      numeroLicencia: doctorData.numeroLicencia || '',
      especialidadId: doctorData.especialidadId || null,
      telefonoConsultorio: doctorData.telefonoConsultorio || '',
      direccionConsultorio: doctorData.direccionConsultorio || '',
      numeroTurnos: 0,
      ultimaConsulta: null,
      proximaDisponibilidad: null
    }, { transaction: t });
    
    console.log('✅ Doctor creado:', doctor.id);
    
    // COMMIT
    await t.commit();
    
    return {
      success: true,
      doctor,
      usuario,
      message: `Doctor ${doctor.id} registrado exitosamente`
    };
    
  } catch (error) {
    await t.rollback();
    
    console.error('❌ Error al registrar doctor:', error.message);
    
    return {
      success: false,
      doctor: null,
      error: error.message
    };
  }
}

// ============================================================
// 4. REGISTRAR PACIENTE - Operación crítica multi-tabla
// ============================================================

/**
 * Registra un nuevo paciente de forma segura
 * 
 * Operaciones:
 * - INSERT usuario
 * - INSERT paciente
 * 
 * @param {Object} pacienteData - { nombre, email, especialidadId?, ... }
 * @returns {Promise<Object>} { success, paciente?, error? }
 */
export async function registrarPaciente(pacienteData) {
  const t = await sequelize.transaction();
  
  try {
    console.log('👤 Registrando paciente:', pacienteData.nombre);
    
    // 1. Validar que email no exista
    const usuarioExistente = await Usuario.findOne({
      where: { email: pacienteData.email },
      transaction: t
    });
    
    if (usuarioExistente) {
      throw new Error(`Email ${pacienteData.email} ya está registrado`);
    }
    
    // 2. CREAR USUARIO (operación 1)
    const usuario = await Usuario.create({
      email: pacienteData.email,
      nombre: pacienteData.nombre,
      tipo: 'paciente',
      estado: 'activo',
      passwordHash: pacienteData.passwordHash || '',
      telefonoContacto: pacienteData.telefonoContacto || '',
      direccion: pacienteData.direccion || '',
      documentoIdentidad: pacienteData.documentoIdentidad || ''
    }, { transaction: t });
    
    console.log('✅ Usuario creado:', usuario.id);
    
    // 3. CREAR PACIENTE (operación 2)
    const paciente = await Paciente.create({
      usuarioId: usuario.id,
      numeroHistoriaClinica: pacienteData.numeroHistoriaClinica || '',
      grupoSanguineo: pacienteData.grupoSanguineo || '',
      alergias: pacienteData.alergias || '',
      numeroTurnos: 0,
      ultimaConsulta: null
    }, { transaction: t });
    
    console.log('✅ Paciente creado:', paciente.id);
    
    // COMMIT
    await t.commit();
    
    return {
      success: true,
      paciente,
      usuario,
      message: `Paciente ${paciente.id} registrado exitosamente`
    };
    
  } catch (error) {
    await t.rollback();
    
    console.error('❌ Error al registrar paciente:', error.message);
    
    return {
      success: false,
      paciente: null,
      error: error.message
    };
  }
}

// ============================================================
// 5. CAMBIAR DOCTOR DE UN TURNO - Operación crítica
// ============================================================

/**
 * Cambia el doctor asignado a un turno existente
 * 
 * Operaciones:
 * - UPDATE turno (nuevo doctor)
 * - UPDATE doctor viejo (actualizar disponibilidad)
 * - UPDATE doctor nuevo (actualizar disponibilidad)
 * 
 * @param {Number} turnoId - ID del turno
 * @param {Number} nuevoDoctoId - ID del nuevo doctor
 * @returns {Promise<Object>} { success, turno?, error? }
 */
export async function cambiarDoctorTurno(turnoId, nuevoDoctoId) {
  const t = await sequelize.transaction();
  
  try {
    console.log('🔄 Cambiando doctor del turno:', turnoId);
    
    // 1. Obtener turno actual
    const turno = await Turno.findByPk(turnoId, { transaction: t });
    
    if (!turno) {
      throw new Error(`Turno ${turnoId} no existe`);
    }
    
    const doctorViejo = turno.doctorId;
    
    // 2. Validar nuevo doctor
    const nuevoDoctor = await Doctor.findByPk(nuevoDoctoId, { transaction: t });
    
    if (!nuevoDoctor) {
      throw new Error(`Doctor ${nuevoDoctoId} no existe`);
    }
    
    // 3. Validar disponibilidad del nuevo doctor
    const conflicto = await Turno.findOne({
      where: {
        doctorId: nuevoDoctoId,
        fechaHora: turno.fechaHora,
        estado: ['pendiente', 'confirmado'],
        id: { [sequelize.Op.ne]: turnoId } // Excluir el turno actual
      },
      transaction: t
    });
    
    if (conflicto) {
      throw new Error('Nuevo doctor no disponible en ese horario');
    }
    
    // 4. ACTUALIZAR TURNO (operación 1)
    await Turno.update(
      { doctorId: nuevoDoctoId },
      { where: { id: turnoId }, transaction: t }
    );
    
    console.log('✅ Turno actualizado');
    
    // 5. ACTUALIZAR DOCTOR VIEJO (operación 2)
    const proximoTurnoViejo = await Turno.findOne({
      where: {
        doctorId: doctorViejo,
        estado: ['pendiente', 'confirmado']
      },
      order: [['fechaHora', 'ASC']],
      transaction: t
    });
    
    await Doctor.update(
      {
        proximaDisponibilidad: proximoTurnoViejo 
          ? new Date(proximoTurnoViejo.fechaHora) 
          : null
      },
      { where: { id: doctorViejo }, transaction: t }
    );
    
    console.log('✅ Doctor viejo actualizado');
    
    // 6. ACTUALIZAR DOCTOR NUEVO (operación 3)
    await Doctor.update(
      {
        proximaDisponibilidad: new Date(turno.fechaHora),
        ultimaConsulta: new Date()
      },
      { where: { id: nuevoDoctoId }, transaction: t }
    );
    
    console.log('✅ Doctor nuevo actualizado');
    
    // COMMIT
    await t.commit();
    
    return {
      success: true,
      turno: { ...turno.dataValues, doctorId: nuevoDoctoId },
      message: `Turno ${turnoId} reasignado exitosamente`
    };
    
  } catch (error) {
    await t.rollback();
    
    console.error('❌ Error al cambiar doctor:', error.message);
    
    return {
      success: false,
      turno: null,
      error: error.message
    };
  }
}

export default {
  agendarTurno,
  cancelarTurno,
  registrarDoctor,
  registrarPaciente,
  cambiarDoctorTurno
};
