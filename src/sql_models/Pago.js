import { DataTypes } from 'sequelize'

export default function initPago(sequelize) {
  const Pago = sequelize.define(
    'Pago',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      turnoId: { type: DataTypes.INTEGER, allowNull: false },
      fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      metodoPago: { type: DataTypes.STRING, allowNull: false },
      estado: { type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'), defaultValue: 'pendiente' },
      paymentIdMp: { type: DataTypes.STRING, allowNull: true },
      _version: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'pagos', timestamps: true }
  )

  return Pago
}
