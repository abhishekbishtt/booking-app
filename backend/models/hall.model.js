const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Hall = sequelize.define('Hall', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  total_rows: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 30 // Reasonable limit for theater rows to ensure visibility and comfort
    }
  },
  seats_per_row: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 50 // Reasonable limit for seats per row
    }
  },
  total_seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  screen_type: {
    type: DataTypes.ENUM('2D', '3D', 'IMAX', '4DX'),
    allowNull: false,
    defaultValue: '2D'
  },
  sound_system: {
    type: DataTypes.ENUM('Stereo', 'Dolby_Digital', 'Dolby_Atmos', 'DTS'),
    allowNull: false,
    defaultValue: 'Stereo'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  facilities: {
    type: DataTypes.ARRAY(DataTypes.STRING), // PostgreSQL array
    allowNull: true,
    defaultValue: []
    // Example: ['AC', 'Wheelchair_Accessible', 'Premium_Seating']
  }
}, {
  tableName: 'halls',
  timestamps: true, // createdAt, updatedAt
  indexes: [
    {
      fields: ['is_active']
    },
    {
      fields: ['screen_type']
    }
  ]
});



module.exports = Hall;
