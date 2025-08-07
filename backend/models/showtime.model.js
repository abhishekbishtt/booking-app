

const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const Movie = require('./movie.model'); 
const Hall = require('./hall.model');   

const Showtime = sequelize.define('Showtime', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  movie_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Movie,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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
  show_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  show_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  available_seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'showtimes',
  timestamps: true
});
console.log('🔍 Showtime model defined successfully.');

module.exports = Showtime ;