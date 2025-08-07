const express = require("express");
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Create a new booking
router.post('/', verifyToken, bookingController.createBooking);

// Get user's own bookings
router.get('/me', verifyToken, bookingController.getMyBookings);

// Get specific booking (user can only see their own)
router.get('/:bookingId', verifyToken, bookingController.getBookingById);

// Cancel a booking
router.patch('/:bookingId/cancel', verifyToken, bookingController.cancelBooking);

// Admin: Get any user's bookings
router.get('/user/:userId', verifyToken, isAdmin, bookingController.getUserBookings);

module.exports = router;
