import { DataTypes } from 'sequelize'

export default function initUsuario(sequelize) {
  return sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      dni: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      _rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Usuario',
      },
    },
    {
      tableName: 'usuarios',
      timestamps: true,
    }
  )
}
