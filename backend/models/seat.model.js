// models/seat.model.js - STANDARDIZED NAMING

const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const Hall = require('./hall.model'); 

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  hall_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Hall,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  row_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seat_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seat_type: {
    type: DataTypes.ENUM('regular', 'premium', 'wheelchair'),
    allowNull: false
  },
  is_wheelchair_accessible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'seats',
  timestamps: false // Only createdAt is used
});



module.exports = Seat;
