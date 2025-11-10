import { DataTypes } from 'sequelize'

export default function initTurno(sequelize) {
  const Turno = sequelize.define(
    'Turno',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fechaHora: { type: DataTypes.DATE, allowNull: false },
      estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pendiente' },
      observaciones: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
      expireAt: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: 'turnos', timestamps: true }
  )

  return Turno
}
