const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// User management
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);
router.get('/users/:userId', verifyToken, isAdmin, adminController.getUserById);

// Movie management
router.post('/movies', verifyToken, isAdmin, adminController.createMovie);
router.put('/movies/:movieId', verifyToken, isAdmin, adminController.updateMovie);
router.delete('/movies/:movieId', verifyToken, isAdmin, adminController.deleteMovie);

// Booking management
router.get('/bookings', verifyToken, isAdmin, adminController.getAllBookings);
router.get('/bookings/:bookingId', verifyToken, isAdmin, adminController.getBookingById);

// Payment management
router.get('/payments', verifyToken, isAdmin, adminController.getAllPayments);
router.get('/payments/:paymentId', verifyToken, isAdmin, adminController.getPaymentById);

// Showtime management (missing from your routes)
router.post('/showtimes', verifyToken, isAdmin, adminController.createShowtime);
router.put('/showtimes/:showtimeId', verifyToken, isAdmin, adminController.updateShowtime);
router.delete('/showtimes/:showtimeId', verifyToken, isAdmin, adminController.deleteShowtime);
router.get('/showtimes/:showtimeId/bookings', verifyToken, isAdmin, adminController.getShowtimeBookings);

//analytics
router.get('/analytics/revenue', verifyToken, isAdmin, adminController.getRevenue);
router.get('/analytics/occupancy', verifyToken, isAdmin, adminController.getOccupancy);
//hall management
router.get('/halls', verifyToken, isAdmin, adminController.getAllHalls);
router.put('/halls/:hallId', verifyToken, isAdmin, adminController.updateHall);


module.exports = router;
