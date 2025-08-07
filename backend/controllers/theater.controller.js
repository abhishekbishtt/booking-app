// controllers/theater.controller.js - CREATE THIS FILE

const { Theater, Hall, City } = require('../models');

// Create theater (Admin only)
exports.createTheater = async (req, res) => {
  try {
    const { name, address, cityId, imax_available, four_dx_available } = req.body;
    
    if (!name || !address || !cityId) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'address', 'city']
      });
    }
    
    const theater = await Theater.create({
      name,
      address,
      cityId,
      imax_available: imax_available || false,
      four_dx_available: four_dx_available || false,
      is_active: true
    });
    
    res.status(201).json({
      message: 'Theater created successfully',
      theater
    });
  } catch (error) {
    console.error('Theater creation error:', error);
    res.status(500).json({ message: 'Error creating theater' });
  }
};

// Get all theaters (admin access)
exports.getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.findAll({
      where: { is_active: true },
      include: [{
        model: Hall,
        as: 'halls',
        where: { is_active: true },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Theaters retrieved successfully',
      count: theaters.length,
      theaters
    });
  } catch (error) {
    console.error('Error fetching theaters:', error);
    res.status(500).json({ message: 'Error fetching theaters' });
  }
};


//get theater by city

exports.getTheaterByCity=async(req,res)=>{

  const city=req.city;
  
}


// Get theater by ID (Public access)
exports.getTheaterById = async (req, res) => {
  try {
    const { theaterId } = req.params;

    if (!theaterId || isNaN(theaterId)) {
      return res.status(400).json({ message: 'Valid theater ID is required' });
    }

    const theater = await Theater.findOne({
      where: { id: theaterId, is_active: true },
      include: [{
        model: Hall,
        as: 'halls',
        where: { is_active: true },
        required: false
      }]
    });

    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    res.status(200).json({
      message: 'Theater retrieved successfully',
      theater
    });
  } catch (error) {
    console.error('Error fetching theater:', error);
    res.status(500).json({ message: 'Error fetching theater' });
  }
};

// Update theater (Admin only)
exports.updateTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    const { name, address, city, imax_available, four_dx_available, is_active } = req.body;

    if (!theaterId || isNaN(theaterId)) {
      return res.status(400).json({ message: 'Valid theater ID is required' });
    }

    const theater = await Theater.findByPk(theaterId);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (address !== undefined) updateFields.address = address;
    if (city !== undefined) updateFields.city = city;
    if (imax_available !== undefined) updateFields.imax_available = imax_available;
    if (four_dx_available !== undefined) updateFields.four_dx_available = four_dx_available;
    if (is_active !== undefined) updateFields.is_active = is_active;

    await theater.update(updateFields);

    res.status(200).json({
      message: 'Theater updated successfully',
      theater
    });
  } catch (error) {
    console.error('Theater update error:', error);
    res.status(500).json({ message: 'Error updating theater' });
  }
};

// Delete theater (Admin only) - Soft delete
exports.deleteTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;

    if (!theaterId || isNaN(theaterId)) {
      return res.status(400).json({ message: 'Valid theater ID is required' });
    }

    const theater = await Theater.findByPk(theaterId);
    
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    await theater.update({ is_active: false });

    res.status(200).json({
      message: 'Theater deleted successfully',
      theaterId: theater.id
    });
  } catch (error) {
    console.error('Theater deletion error:', error);
    res.status(500).json({ message: 'Error deleting theater' });
  }
};



// Get theaters by city
exports.getTheatersByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    if (!cityId || isNaN(cityId)) {
      return res.status(400).json({ message: 'Valid city ID is required' });
    }

    const theaters = await Theater.findAll({
      where: { 
        cityId: cityId,
        is_active: true 
      },
      include: [
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name', 'state']
        },
        {
          model: Hall,
          as: 'halls',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'name', 'formatType', 'totalSeats']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Theaters retrieved successfully',
      cityId: parseInt(cityId),
      count: theaters.length,
      theaters
    });
  } catch (error) {
    console.error('Error fetching theaters by city:', error);
    res.status(500).json({ message: 'Error fetching theaters' });
  }
};

// Get theaters showing a specific movie in a city
exports.getMovieTheatersInCity = async (req, res) => {
  try {
    const { movieId, cityId } = req.params;
    const { date } = req.query;

    if (!movieId || isNaN(movieId)) {
      return res.status(400).json({ message: 'Valid movie ID is required' });
    }

    if (!cityId || isNaN(cityId)) {
      return res.status(400).json({ message: 'Valid city ID is required' });
    }

    const showDate = date || new Date().toISOString().split('T')[0];

    const theaters = await Theater.findAll({
      where: { 
        cityId: cityId,
        is_active: true 
      },
      include: [
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name', 'state']
        },
        {
          model: Hall,
          as: 'halls',
          include: [{
            model: Showtime,
            as: 'showtimes',
            where: {
              movieId: movieId,
              showDate: showDate,
              isActive: true
            },
            include: [{
              model: Movie,
              as: 'movie',
              attributes: ['id', 'title', 'duration', 'certification']
            }],
            attributes: ['id', 'showTime', 'basePrice', 'availableSeats'],
            required: true
          }],
          attributes: ['id', 'name', 'formatType'],
          required: true
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Theaters showing movie in city retrieved successfully',
      movieId: parseInt(movieId),
      cityId: parseInt(cityId),
      date: showDate,
      count: theaters.length,
      theaters
    });
  } catch (error) {
    console.error('Error fetching movie theaters in city:', error);
    res.status(500).json({ message: 'Error fetching theaters' });
  }
};