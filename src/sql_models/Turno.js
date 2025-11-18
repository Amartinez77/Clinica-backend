import { DataTypes } from 'sequelize'

export default function initTurno(sequelize) {
  const Turno = sequelize.define(
    'Turno',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      pacienteId: { type: DataTypes.INTEGER, allowNull: false },
      doctorId: { type: DataTypes.INTEGER, allowNull: false },
      fechaHora: { type: DataTypes.DATE, allowNull: false },
      razonConsulta: { type: DataTypes.TEXT, allowNull: true },
      estado: { type: DataTypes.ENUM('pendiente', 'confirmado', 'completado', 'cancelado'), defaultValue: 'pendiente' },
      notas: { type: DataTypes.TEXT, allowNull: true },
    },
    { 
      tableName: 'turnos', 
      timestamps: true,
      indexes: [
        { fields: ['pacienteId', 'fechaHora'] },
        { fields: ['doctorId', 'fechaHora'] },
        { fields: ['estado'] },
        { unique: true, fields: ['doctorId', 'fechaHora'] }
      ]
    }
  )

  return Turno
}
