import { DataTypes } from 'sequelize'

export default function initUsuario(sequelize) {
  return sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      dni: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM('paciente', 'doctor', 'admin'),
        allowNull: false,
      },
      rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [['paciente', 'doctor', 'admin']],
        },
      },
    },
    {
      tableName: 'usuarios',
      timestamps: true, // Sequelize usará createdAt y updatedAt por defecto
    }
  )
}
