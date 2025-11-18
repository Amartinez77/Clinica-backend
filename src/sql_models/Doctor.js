import { DataTypes } from 'sequelize'

export default function initDoctor(sequelize) {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      usuario_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      especialidadId: { type: DataTypes.INTEGER, allowNull: false },
      matricula: { type: DataTypes.STRING, allowNull: false, unique: true },
      precioConsulta: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      telefono: { type: DataTypes.STRING(15), allowNull: false },
      estado: { type: DataTypes.ENUM('activo', 'inactivo'), defaultValue: 'activo' },
      disponibilidad: { type: DataTypes.JSON, allowNull: true },
    },
    { tableName: 'doctores', timestamps: true }
  )

  return Doctor
}
