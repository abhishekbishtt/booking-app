const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');

// Get seat availability for a specific showtime
router.get('/:showtimeId/seats', showtimeController.getSeatAvailability);

// Get all showtimes for a specific movie
router.get('/movie/:movieId', showtimeController.getShowtimesByMovie);

// Reserve seats temporarily
router.post('/:showtimeId/reserve', showtimeController.reserveSeats);

// Get showtime details
router.get('/:showtimeId', showtimeController.getShowtimeById);


module.exports = router;
