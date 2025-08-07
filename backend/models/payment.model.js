const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');
const User = require('./user.model');              
const Reservation = require('./reservation.model'); 

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  reservation_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Reservation,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  razorpay_order_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpay_payment_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpay_signature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('created', 'pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'created'
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failure_reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments',
  timestamps: true
});



module.exports = Payment;
