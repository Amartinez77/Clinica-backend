import { DataTypes } from 'sequelize'

export default function initDoctor(sequelize) {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dni: { type: DataTypes.STRING(15), allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: false },
      nombre: { type: DataTypes.STRING, allowNull: false },
      apellido: { type: DataTypes.STRING, allowNull: false },
      matricula: { type: DataTypes.STRING, allowNull: false, unique: true },
      especialidadId: { type: DataTypes.INTEGER, allowNull: false },
      precioConsulta: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      telefono: { type: DataTypes.STRING(15), allowNull: false },
      estado: { type: DataTypes.ENUM('activo', 'inactivo'), defaultValue: 'activo' },
      disponibilidad: { type: DataTypes.JSON, allowNull: true },
      _rol: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Doctor' },
      _version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'doctors', timestamps: true }
  )

  return Doctor
}
