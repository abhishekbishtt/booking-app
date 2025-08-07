
const { User } = require('./user.model');
const { Movie } = require('./movie.model');
const { Hall } = require('./hall.model');
const { Seat } = require('./seat.model');
const { Showtime } = require('./showtime.model');
const { Reservation } = require('./reservation.model');
const { Payment } = require('./payment.model');
const { BookedSeats } = require('./booked-seats.model');


Movie.hasMany(Showtime, { foreignKey: 'movie_id', as: 'showtimes' });
Showtime.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

Hall.hasMany(Showtime, { foreignKey: 'hall_id', as: 'showtimes' });
Showtime.belongsTo(Hall, { foreignKey: 'hall_id', as: 'hall' });

Hall.hasMany(Seat, { foreignKey: 'hall_id', as: 'seats' });
Seat.belongsTo(Hall, { foreignKey: 'hall_id', as: 'hall' });

User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Reservation.hasOne(Payment, { foreignKey: 'reservation_id', as: 'payment' });
Payment.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });

// BookedSeats - minimal relationships for when you need joins
Payment.hasMany(BookedSeats, { foreignKey: 'payment_id', as: 'bookedSeats' });
BookedSeats.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

module.exports = {
  User, Movie, Hall, Seat, Showtime, 
  Reservation, Payment, BookedSeats
};
