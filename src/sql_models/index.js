import initUsuario from './Usuario.js'
import initPaciente from './Paciente.js'
import initDoctor from './Doctor.js'
import initEspecialidad from './Especialidad.js'
import initTurno from './Turno.js'
import initPago from './Pago.js'
import initArchivo from './Archivo.js'

/**
 * Inicializa todos los modelos y sus asociaciones
 * @param {Sequelize} sequelize
 */
export default function initModels(sequelize) {
  const Usuario = initUsuario(sequelize)
  const Paciente = initPaciente(sequelize)
  const Especialidad = initEspecialidad(sequelize)
  const Doctor = initDoctor(sequelize)
  const Turno = initTurno(sequelize)
  const Pago = initPago(sequelize)
  const Archivo = initArchivo(sequelize)

  // Asociaciones
  // Doctor - Especialidad (many doctors belong to one especialidad)
  Especialidad.hasMany(Doctor, { foreignKey: 'especialidadId' })
  Doctor.belongsTo(Especialidad, { foreignKey: 'especialidadId' })

  // Turno - Paciente, Turno - Doctor
  Paciente.hasMany(Turno, { foreignKey: 'pacienteId' })
  Turno.belongsTo(Paciente, { foreignKey: 'pacienteId' })

  Doctor.hasMany(Turno, { foreignKey: 'doctorId' })
  Turno.belongsTo(Doctor, { foreignKey: 'doctorId' })

  // Pago - Turno (1 pago por turno)
  Turno.hasOne(Pago, { foreignKey: 'turnoId' })
  Pago.belongsTo(Turno, { foreignKey: 'turnoId' })

  // Archivo - Turno (un archivo puede pertenecer a un turno)
  Turno.hasMany(Archivo, { foreignKey: 'turnoId' })
  Archivo.belongsTo(Turno, { foreignKey: 'turnoId' })

  return {
    Usuario,
    Paciente,
    Doctor,
    Especialidad,
    Turno,
    Pago,
    Archivo,
  }
}
