import { DataTypes } from 'sequelize'

export default function initPago(sequelize) {
  const Pago = sequelize.define(
    'Pago',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      monto: { type: DataTypes.FLOAT, allowNull: false },
      metodoPago: { type: DataTypes.STRING, allowNull: false },
      estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pendiente' },
      paymentIdMp: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: 'pagos', timestamps: true }
  )

  return Pago
}
