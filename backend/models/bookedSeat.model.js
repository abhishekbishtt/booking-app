// models/booked-seats.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const BookedSeats = sequelize.define('BookedSeats', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  seat_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payment_id: {
    type: DataTypes.STRING,
    allowNull: true // null until payment completed
  },
  showtime_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seat_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  booking_status: {
    type: DataTypes.ENUM('reserved', 'confirmed', 'cancelled'),
    defaultValue: 'reserved'
  },
  reserved_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'booked_seats',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['seat_id', 'showtime_id'] 
    }
  ]
});

module.exports = BookedSeats;
