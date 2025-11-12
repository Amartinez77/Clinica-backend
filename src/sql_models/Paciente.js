import { DataTypes } from 'sequelize'

export default function initPaciente(sequelize) {
  const Paciente = sequelize.define(
    'Paciente',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dni: { type: DataTypes.STRING(15), allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      password: { type: DataTypes.STRING, allowNull: false },
      nombre: { type: DataTypes.STRING, allowNull: false },
      apellido: { type: DataTypes.STRING, allowNull: false },
      telefono: { type: DataTypes.STRING(15), allowNull: false },
      fechaNacimiento: { type: DataTypes.DATE, allowNull: false },
      numeroSeguridadSocial: { type: DataTypes.STRING, allowNull: true },
      numeroAfiliado: { type: DataTypes.STRING, allowNull: true },
      grupoSanguineo: { type: DataTypes.ENUM('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'), allowNull: true },
      alergias: { type: DataTypes.TEXT, allowNull: true },
      enfermedadesCronicas: { type: DataTypes.TEXT, allowNull: true },
      medicamentos: { type: DataTypes.TEXT, allowNull: true },
      contactoEmergencia: { type: DataTypes.STRING, allowNull: true },
      telefonoContacto: { type: DataTypes.STRING, allowNull: true },
      uid_firebase: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      _rol: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Paciente' },
      _version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'pacientes', timestamps: true }
  )

  return Paciente
}
