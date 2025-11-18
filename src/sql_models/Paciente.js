import { DataTypes } from 'sequelize'

export default function initPaciente(sequelize) {
  const Paciente = sequelize.define(
    'Paciente',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      usuario_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
      },
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
      uid_firebase: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: 'pacientes', timestamps: true }
  )

  return Paciente
}
