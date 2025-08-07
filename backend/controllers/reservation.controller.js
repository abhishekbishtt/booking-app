
const { Reservation, User, Showtime, Movie, Hall, Theater } = require('../models');
const { Op } = require('sequelize');

// Create a new reservation
const createReservation = async (req, res) => {
  const { showtimeId, selectedSeats, totalAmount } = req.body;
  const userId = req.user.id;

  try {
    
    if (!showtimeId || !selectedSeats || !totalAmount) {
      return res.status(400).json({ 
        message: 'Missing required fields: showtimeId, selectedSeats, and totalAmount are required' 
      });
    }

    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ 
        message: 'Selected seats must be a non-empty array' 
      });
    }

    if (selectedSeats.length > 10) {
      return res.status(400).json({ 
        message: 'Cannot book more than 10 seats at once' 
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ 
        message: 'Total amount must be greater than 0' 
      });
    }

    // Verify showtime exists
    const showtime = await Showtime.findByPk(showtimeId, {
      include: [
        { model: Movie, as: 'movie', attributes: ['id', 'title'] },
        { model: Hall, as: 'hall', attributes: ['id', 'name'] }
      ]
    });

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    //  Check if showtime is in the past
    const showtimeDateTime = new Date(`${showtime.showDate}T${showtime.showTime}`);
    const now = new Date();
    
    if (showtimeDateTime <= now) {
      return res.status(400).json({ 
        message: 'Cannot book tickets for past or ongoing showtimes' 
      });
    }

    //  Get all existing reservations for this showtime
    const existingReservations = await Reservation.findAll({
      where: { 
        showtimeId,
        status: { [Op.ne]: 'cancelled' } // Exclude cancelled reservations
      },
      attributes: ['selectedSeats', 'status']
    });

    // Count total reserved seats properly
    let totalReservedSeats = 0;
    const allReservedSeats = [];
    
    existingReservations.forEach(reservation => {
      if (Array.isArray(reservation.selectedSeats)) {
        totalReservedSeats += reservation.selectedSeats.length;
        allReservedSeats.push(...reservation.selectedSeats);
      }
    });

    //  Check seat availability
    const availableSeats = showtime.availableSeats - totalReservedSeats;
    
    if (selectedSeats.length > availableSeats) {
      return res.status(400).json({ 
        message: `Only ${availableSeats} seats available, but ${selectedSeats.length} requested`,
        availableSeats,
        requestedSeats: selectedSeats.length
      });
    }

    //  Check for duplicate seat bookings
    const duplicateSeats = selectedSeats.filter(seat => allReservedSeats.includes(seat));
    if (duplicateSeats.length > 0) {
      return res.status(400).json({
        message: 'Some seats are already booked',
        unavailableSeats: duplicateSeats,
        availableSeats: availableSeats
      });
    }

    // Validate seat format 
    const seatPattern = /^[A-Z]\d+$/;
    const invalidSeats = selectedSeats.filter(seat => !seatPattern.test(seat));
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message: 'Invalid seat format. Use format like A1, B5, etc.',
        invalidSeats
      });
    }

    // Create the reservation
    const reservation = await Reservation.create({
      userId,
      showtimeId,
      selectedSeats,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    //  Fetch reservation with full details for response
    const reservationWithDetails = await Reservation.findByPk(reservation.id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        { 
          model: Showtime, 
          as: 'showtime',
          attributes: ['id', 'showDate', 'showTime', 'basePrice'],
          include: [
            { 
              model: Movie, 
              as: 'movie',
              attributes: ['id', 'title', 'genre', 'duration', 'certification']
            },
            { 
              model: Hall, 
              as: 'hall',
              attributes: ['id', 'name', 'formatType'],
              include: [{ 
                model: Theater, 
                as: 'theater',
                attributes: ['id', 'name', 'address', 'city']
              }]
            }
          ]
        }
      ]
    });

    return res.status(201).json({
      message: 'Reservation created successfully',
      reservation: reservationWithDetails
    });

  } catch (error) {
    
    console.error('Reservation creation failed:', {
      userId,
      showtimeId,
      selectedSeats,
      error: error.message,
      stack: error.stack
    });

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }

    //  Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Reservation conflict occurred'
      });
    }

    // Generic error response (don't expose internal details....)
    return res.status(500).json({ 
      message: 'Unable to create reservation. Please try again later.' 
    });
  }
};

// Get user's reservations
const getUserReservations = async (req, res) => {
  const userId = req.user.id;

  try {
    const reservations = await Reservation.findAll({
      where: { userId },
      include: [
        {
          model: Showtime,
          as: 'showtime',
          attributes: ['id', 'showDate', 'showTime', 'basePrice'],
          include: [
            { 
              model: Movie, 
              as: 'movie',
              attributes: ['id', 'title', 'genre', 'duration', 'certification', 'posterImage']
            },
            { 
              model: Hall, 
              as: 'hall',
              attributes: ['id', 'name', 'formatType'],
              include: [{ 
                model: Theater, 
                as: 'theater',
                attributes: ['id', 'name', 'address', 'city']
              }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Reservations retrieved successfully',
      count: reservations.length,
      reservations
    });

  } catch (error) {
    console.error('Failed to fetch user reservations:', {
      userId,
      error: error.message
    });

    return res.status(500).json({ 
      message: 'Unable to fetch reservations. Please try again later.' 
    });
  }
};

// Get reservations for a specific showtime (Admin only)
const getShowtimeReservations = async (req, res) => {
  const { showtimeId } = req.params;

  try {
    if (!showtimeId || isNaN(showtimeId)) {
      return res.status(400).json({ message: 'Valid showtime ID is required' });
    }

    // Verify showtime exists
    const showtime = await Showtime.findByPk(showtimeId, {
      include: [
        { model: Movie, as: 'movie', attributes: ['title'] },
        { model: Hall, as: 'hall', attributes: ['name'] }
      ]
    });

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    const reservations = await Reservation.findAll({
      where: { showtimeId },
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email'] // Don't include password for saftery purposes...
        }
      ],
      order: [['createdAt', 'DESC']]
    });


    let totalReservedSeats = 0;
    let confirmedSeats = 0;
    let pendingSeats = 0;
    const allReservedSeats = [];

    reservations.forEach(reservation => {
      if (Array.isArray(reservation.selectedSeats)) {
        const seatCount = reservation.selectedSeats.length;
        totalReservedSeats += seatCount;
        
        if (reservation.status === 'confirmed') {
          confirmedSeats += seatCount;
        } else if (reservation.status === 'pending') {
          pendingSeats += seatCount;
        }
        
        allReservedSeats.push(...reservation.selectedSeats);
      }
    });

    return res.status(200).json({
      message: 'Showtime reservations retrieved successfully',
      showtime: {
        id: showtime.id,
        movie: showtime.movie?.title,
        hall: showtime.hall?.name,
        showDate: showtime.showDate,
        showTime: showtime.showTime
      },
      statistics: {
        totalSeats: showtime.availableSeats,
        reservedSeats: totalReservedSeats,
        confirmedSeats,
        pendingSeats,
        availableSeats: showtime.availableSeats - totalReservedSeats
      },
      count: reservations.length,
      reservations
    });

  } catch (error) {
    console.error('Failed to fetch showtime reservations:', {
      showtimeId,
      error: error.message
    });

    return res.status(500).json({ 
      message: 'Unable to fetch showtime reservations. Please try again later.' 
    });
  }
};

// Cancel a reservation
const cancelReservation = async (req, res) => {
  const { reservationId } = req.params;
  const userId = req.user.id;

  try {
    if (!reservationId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Valid reservation ID is required' });
    }

    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId: userId
      },
      include: [{
        model: Showtime,
        as: 'showtime',
        attributes: ['showDate', 'showTime']
      }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or unauthorized' });
    }

    //Check if reservation can be cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled' });
    }

    // Check if showtime is in the past
    const showtime = reservation.showtime;
    const showtimeDateTime = new Date(`${showtime.showDate}T${showtime.showTime}`);
    
    if (showtimeDateTime <= new Date()) {
      return res.status(400).json({ 
        message: 'Cannot cancel past or ongoing reservations' 
      });
    }

    // Check cancellation time limit (e.g., 2 hours before showtime)
    const twoHoursBeforeShowtime = new Date(showtimeDateTime.getTime() - (2 * 60 * 60 * 1000));
    
    if (new Date() > twoHoursBeforeShowtime) {
      return res.status(400).json({ 
        message: 'Cannot cancel reservation less than 2 hours before showtime' 
      });
    }

    await reservation.update({ 
      status: 'cancelled',
      paymentStatus: 'refunded' // will be encorporating refund triggering razor pay api later
    });

    return res.status(200).json({ 
      message: 'Reservation cancelled successfully',
      reservationId: reservation.id,
      refundInfo: 'Refund will be processed within 3-5 business days'
    });

  } catch (error) {
    console.error('Failed to cancel reservation:', {
      reservationId,
      userId,
      error: error.message
    });

    return res.status(500).json({ 
      message: 'Unable to cancel reservation. Please try again later.' 
    });
  }
};

// Get reservation by ID (User can only access their own)
const getReservationById = async (req, res) => {
  const { reservationId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    if (!reservationId || isNaN(reservationId)) {
      return res.status(400).json({ message: 'Valid reservation ID is required' });
    }

  
    const whereClause = { id: reservationId };
    if (userRole !== 'admin') {
      whereClause.userId = userId; // Regular users can only see their own reservations
    }

    const reservation = await Reservation.findOne({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Showtime,
          as: 'showtime',
          include: [
            { model: Movie, as: 'movie' },
            { 
              model: Hall, 
              as: 'hall',
              include: [{ model: Theater, as: 'theater' }]
            }
          ]
        }
      ]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or unauthorized' });
    }

    return res.status(200).json({
      message: 'Reservation retrieved successfully',
      reservation
    });

  } catch (error) {
    console.error('Failed to fetch reservation:', {
      reservationId,
      userId,
      error: error.message
    });

    return res.status(500).json({ 
      message: 'Unable to fetch reservation. Please try again later.' 
    });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  getShowtimeReservations,
  cancelReservation,
  getReservationById
};
