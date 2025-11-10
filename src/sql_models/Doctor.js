import { DataTypes } from 'sequelize'

export default function initDoctor(sequelize) {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dni: { type: DataTypes.STRING(8), allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: true },
      nombre: { type: DataTypes.STRING, allowNull: false },
      apellido: { type: DataTypes.STRING, allowNull: true },
      matricula: { type: DataTypes.STRING, allowNull: false, unique: true },
      precioConsulta: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      telefono: { type: DataTypes.STRING, allowNull: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'doctores', timestamps: true }
  )

  return Doctor
}
