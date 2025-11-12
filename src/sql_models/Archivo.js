import { DataTypes } from 'sequelize'

export default function initArchivo(sequelize) {
  const Archivo = sequelize.define(
    'Archivo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      turnoId: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.STRING, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      nombre: { type: DataTypes.STRING, allowNull: false },
      fechaSubida: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      _version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'archivos', timestamps: true }
  )

  return Archivo
}
