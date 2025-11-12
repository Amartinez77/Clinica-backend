import { DataTypes } from 'sequelize'

export default function initEspecialidad(sequelize) {
  const Especialidad = sequelize.define(
    'Especialidad',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
      descripcion: { type: DataTypes.TEXT, allowNull: true },
      _version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'especialidades', timestamps: true }
  )

  return Especialidad
}
