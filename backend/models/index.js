

'use strict';

// Import database connection
const { sequelize } = require('./db');

// Import all models (these export objects, not functions)
console.log('🔄 Loading all models...');

const { User } = require('./user.model');
const { Movie } = require('./movie.model');

const { Hall } = require('./hall.model');
const { Seat } = require('./seat.model');
const { Showtime } = require('./showtime.model');

const { Payment } = require('./payment.model');
const { BookedSeats } = require('./booked-seats.model');  
const{BlackListedTokens} = require('./blackListedToken.model'); // Import blacklisted tokens model


console.log('✅ All models loaded successfully');

// Initialize associations
console.log('🔗 Setting up model associations...');
require('./association');
console.log('✅ All associations configured');

// Create bundle of models object for export so that we can import and destructure directly by importing this whole bundele

const models = {
  sequelize,
  User,
  Movie,
 BlackListedTokens,
  BookedSeats,
  Payment,
  Hall,
  Seat,
  Showtime,

  

  Sequelize: require('sequelize')
};

// sync database in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode - checking database sync...');
  
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('✅ Database synchronized successfully');
    })
    .catch((error) => {
      console.error('❌ Database sync failed:', error.message);
    });
}

module.exports = models;
