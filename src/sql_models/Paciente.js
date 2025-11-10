import { DataTypes } from 'sequelize'

export default function initPaciente(sequelize) {
  const Paciente = sequelize.define(
    'Paciente',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dni: { type: DataTypes.STRING(8), allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: true },
      nombre: { type: DataTypes.STRING, allowNull: false },
      apellido: { type: DataTypes.STRING, allowNull: true },
      telefono: { type: DataTypes.STRING, allowNull: true },
      fechaNacimiento: { type: DataTypes.STRING, allowNull: true },
      uid_firebase: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    },
    { tableName: 'pacientes', timestamps: true }
  )

  return Paciente
}
