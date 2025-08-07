const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cast: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    director: {
      type: DataTypes.STRING,
      allowNull: true
    },
    genre: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    age_rating: {
      type: DataTypes.ENUM('U', 'UA', 'A'),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true
    },
    poster_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_trending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
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
    tableName: 'movies',
    timestamps: true
  });
  
  module.exports = Movie;