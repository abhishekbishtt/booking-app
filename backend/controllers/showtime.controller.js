
const { Showtime, Movie, Hall, Theater } = require("../models");

// Create a new showtime (Admin only)
exports.CreateShowtime = async (req, res) => {
  try {
    const { movieId } = req.params;  // Get movieId from URL params
    
    
    const { 
      showDate,       
      showTime,        
      basePrice,       
      availableSeats,  
      hallId          
    } = req.body;

    // Validate required fields
    if (!showDate || !showTime || !basePrice || !availableSeats || !hallId) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["showDate", "showTime", "basePrice", "availableSeats", "hallId"]
      });
    }

    // Verify movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Verify hall exists 
    if (hallId) {
      const hall = await Hall.findByPk(hallId);
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
    }

    // Create showtime with correct field mapping
    const newShowtime = await Showtime.create({
      movieId: parseInt(movieId), 
      hallId: parseInt(hallId),   
      showDate,                    
      showTime,                    
      basePrice: parseFloat(basePrice),      
      availableSeats: parseInt(availableSeats), 
      isActive: true
    });

    return res.status(201).json({
      message: "Showtime created successfully",
      showtime: newShowtime
    });

  } catch (error) {
    console.error("Showtime creation error:", error);
    
    //  Handle validation errors
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
    
    return res.status(500).json({
      message: 'Error creating showtime'
    });
  }
};

// Get showtimes for a specific movie (Public access)
exports.getMovieShowtimes = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId || isNaN(movieId)) {
      return res.status(400).json({ message: 'Valid movie ID is required' });
    }

    //  Verify movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const showtimes = await Showtime.findAll({
      where: { 
        movieId: movieId,
        isActive: true 
      },
      include: [
        { 
          model: Movie, 
          as: 'movie', 
          attributes: ['id', 'title', 'duration', 'certification', 'genre'] 
        },
        { 
          model: Hall, 
          as: 'hall', 
          attributes: ['id', 'name', 'formatType', 'totalSeats'],
          include: [{ 
            model: Theater, 
            as: 'theater',
            attributes: ['id', 'name', 'address', 'cityId']
          }] 
        }
      ],
      order: [['showDate', 'ASC'], ['showTime', 'ASC']]
    });

    res.status(200).json({
      message: 'Showtimes retrieved successfully',
      movieId: parseInt(movieId),
      count: showtimes.length,
      showtimes
    });

  } catch (error) {
    console.error('Error fetching showtimes:', error);
    res.status(500).json({ message: 'Error fetching showtimes' });
  }
};

// Get all showtimes with filtering (Admin access)
exports.getAllShowtimes = async (req, res) => {
  try {
    const { date, movieId, hallId, theaterId } = req.query;
    
    //customhere clause for selecting only active showtimes
    const whereClause = { isActive: true };
    
    if (date) {
      whereClause.showDate = date;
    }
    
    if (movieId) {
      whereClause.movieId = movieId;
    }
    
    if (hallId) {
      whereClause.hallId = hallId;
    }

    //  include clause for theater filtering
    const includeClause = [
      { model: Movie, as: 'movie' },
      { 
        model: Hall, 
        as: 'hall',
        include: [{ model: Theater, as: 'theater' }]
      }
    ];

    if (theaterId) {
      includeClause[1].include[0].where = { id: theaterId };
    }

    const showtimes = await Showtime.findAll({
      where: whereClause,
      include: includeClause,
      order: [['showDate', 'ASC'], ['showTime', 'ASC']]
    });

    res.status(200).json({
      message: 'All showtimes retrieved successfully',
      filters: { date, movieId, hallId, theaterId },
      count: showtimes.length,
      showtimes
    });

  } catch (error) {
    console.error('Error fetching all showtimes:', error);
    res.status(500).json({ message: 'Error fetching showtimes' });
  }
};

// Get single showtime by ID (Public access)
exports.getShowtimeById = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    if (!showtimeId || isNaN(showtimeId)) {
      return res.status(400).json({ message: 'Valid showtime ID is required' });
    }

    const showtime = await Showtime.findOne({
      where: { 
        id: showtimeId,
        isActive: true 
      },
      include: [
        { model: Movie, as: 'movie' },
        { 
          model: Hall, 
          as: 'hall',
          include: [{ model: Theater, as: 'theater' }] 
        }
      ]
    });

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    res.status(200).json({
      message: 'Showtime retrieved successfully',
      showtime
    });

  } catch (error) {
    console.error('Error fetching showtime:', error);
    res.status(500).json({ message: 'Error fetching showtime' });
  }
};

// Update showtime (Admin access)
exports.updateShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    if (!showtimeId || isNaN(showtimeId)) {
      return res.status(400).json({ message: 'Valid showtime ID is required' });
    }

    const showtime = await Showtime.findByPk(showtimeId);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // ✅ Extract updatable fields
    const { 
      showDate, 
      showTime, 
      basePrice, 
      availableSeats, 
      hallId, 
      isActive 
    } = req.body;

    // ✅ Verify hall exists if hallId is being updated
    if (hallId && hallId !== showtime.hallId) {
      const hall = await Hall.findByPk(hallId);
      if (!hall) {
        return res.status(404).json({ message: "Hall not found" });
      }
    }

    // ✅ Build update object with only provided fields
    const updateFields = {};
    
    if (showDate !== undefined) updateFields.showDate = showDate;
    if (showTime !== undefined) updateFields.showTime = showTime;
    if (basePrice !== undefined) updateFields.basePrice = parseFloat(basePrice);
    if (availableSeats !== undefined) updateFields.availableSeats = parseInt(availableSeats);
    if (hallId !== undefined) updateFields.hallId = parseInt(hallId);
    if (isActive !== undefined) updateFields.isActive = isActive;

    await showtime.update(updateFields);

    // Fetch updated showtime with associations
    const updatedShowtime = await Showtime.findByPk(showtimeId, {
      include: [
        { model: Movie, as: 'movie' },
        { 
          model: Hall, 
          as: 'hall',
          include: [{ model: Theater, as: 'theater' }] 
        }
      ]
    });

    res.status(200).json({ 
      message: 'Showtime updated successfully', 
      showtime: updatedShowtime 
    });

  } catch (error) {
    console.error('Showtime update error:', error);
    
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
    
    res.status(500).json({ message: 'Error updating showtime' });
  }
};

// Delete showtime - Soft delete (Admin access)
exports.deleteShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    if (!showtimeId || isNaN(showtimeId)) {
      return res.status(400).json({ message: 'Valid showtime ID is required' });
    }

    const showtime = await Showtime.findByPk(showtimeId);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check if showtime has any reservations
    const { Reservation } = require('../models');
    const reservationCount = await Reservation.count({
      where: { showtimeId: showtimeId }
    });

    if (reservationCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete showtime with existing reservations',
        reservationCount 
      });
    }

    // Soft delete - mark as inactive
    await showtime.update({ isActive: false });

    res.status(200).json({ 
      message: 'Showtime deleted successfully',
      showtimeId: showtime.id
    });

  } catch (error) {
    console.error('Showtime deletion error:', error);
    res.status(500).json({ message: 'Error deleting showtime' });
  }
};

// Permanent delete showtime (Admin access)
exports.permanentDeleteShowtime = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    if (!showtimeId || isNaN(showtimeId)) {
      return res.status(400).json({ message: 'Valid showtime ID is required' });
    }

    const showtime = await Showtime.findByPk(showtimeId);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check if showtime has any reservations
    const { Reservation } = require('../models');
    const reservationCount = await Reservation.count({
      where: { showtimeId: showtimeId }
    });

    if (reservationCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot permanently delete showtime with existing reservations',
        reservationCount 
      });
    }

    await showtime.destroy();

    res.status(200).json({ 
      message: 'Showtime permanently deleted',
      showtimeId: parseInt(showtimeId)
    });

  } catch (error) {
    console.error('Showtime permanent deletion error:', error);
    res.status(500).json({ message: 'Error permanently deleting showtime' });
  }
};

// Get showtimes by date range (Public access)
exports.getShowtimesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, movieId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required',
        format: 'YYYY-MM-DD'
      });
    }

    
    const whereClause = {
      isActive: true,
      showDate: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    };

    if (movieId) {
      whereClause.movieId = movieId;
    }

    const showtimes = await Showtime.findAll({
      where: whereClause,
      include: [
        { model: Movie, as: 'movie' },
        { 
          model: Hall, 
          as: 'hall',
          include: [{ model: Theater, as: 'theater' }] 
        }
      ],
      order: [['showDate', 'ASC'], ['showTime', 'ASC']]
    });

    res.status(200).json({
      message: 'Showtimes retrieved successfully',
      dateRange: { startDate, endDate },
      movieId: movieId || 'all',
      count: showtimes.length,
      showtimes
    });

  } catch (error) {
    console.error('Error fetching showtimes by date range:', error);
    res.status(500).json({ message: 'Error fetching showtimes' });
  }
};
