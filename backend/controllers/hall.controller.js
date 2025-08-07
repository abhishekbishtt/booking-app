
const { Hall, Theater } = require('../models');

// Create hall (Admin only)
exports.createHall = async (req, res) => {
  try {
    const { name, theaterId, formatType, totalSeats, wheelchairAccessible } = req.body;
    
    if (!name || !theaterId || !totalSeats) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'theaterId', 'totalSeats']
      });
    }
    
    // Verify theater exists
    const theater = await Theater.findByPk(theaterId);
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    
    const hall = await Hall.create({
      name,
      theaterId,
      formatType: formatType || '2D',
      totalSeats,
      wheelchairAccessible: wheelchairAccessible || false,
      is_active: true
    });
    
    res.status(201).json({
      message: 'Hall created successfully',
      hall
    });
  } catch (error) {
    console.error('Hall creation error:', error);
    res.status(500).json({ message: 'Error creating hall' });
  }
};

// Get all halls (Public access)
exports.getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.findAll({
      where: { is_active: true },
      include: [{
        model: Theater,
        as: 'theater',
        attributes: ['id', 'name', 'city']
      }],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Halls retrieved successfully',
      count: halls.length,
      halls
    });
  } catch (error) {
    console.error('Error fetching halls:', error);
    res.status(500).json({ message: 'Error fetching halls' });
  }
};

// Get halls by theater (Public access)
exports.getHallsByTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;

    if (!theaterId || isNaN(theaterId)) {
      return res.status(400).json({ message: 'Valid theater ID is required' });
    }

    const halls = await Hall.findAll({
      where: { 
        theaterId: theaterId,
        is_active: true 
      },
      include: [{
        model: Theater,
        as: 'theater',
        attributes: ['id', 'name', 'cityId']
      }],
      
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Theater halls retrieved successfully',
      theaterId: parseInt(theaterId),
      count: halls.length,
      halls
    });
  } catch (error) {
    console.error('Error fetching theater halls:', error);
    res.status(500).json({ message: 'Error fetching halls' });
  }
};

// Get hall by ID (Public access)
exports.getHallById = async (req, res) => {
  try {
    const { hallId } = req.params;

    if (!hallId || isNaN(hallId)) {
      return res.status(400).json({ message: 'Valid hall ID is required' });
    }

    const hall = await Hall.findOne({
      where: { id: hallId, is_active: true },
      include: [{
        model: Theater,
        as: 'theater'
      }]
    });

    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    res.status(200).json({
      message: 'Hall retrieved successfully',
      hall
    });
  } catch (error) {
    console.error('Error fetching hall:', error);
    res.status(500).json({ message: 'Error fetching hall' });
  }
};

// Update hall (Admin only)
exports.updateHall = async (req, res) => {
  try {
    const { hallId } = req.params;
    const { name, formatType, totalSeats, wheelchairAccessible, is_active } = req.body;

    if (!hallId || isNaN(hallId)) {
      return res.status(400).json({ message: 'Valid hall ID is required' });
    }

    const hall = await Hall.findByPk(hallId);
    
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (formatType !== undefined) updateFields.formatType = formatType;
    if (totalSeats !== undefined) updateFields.totalSeats = totalSeats;
    if (wheelchairAccessible !== undefined) updateFields.wheelchairAccessible = wheelchairAccessible;
    if (is_active !== undefined) updateFields.is_active = is_active;

    await hall.update(updateFields);

    res.status(200).json({
      message: 'Hall updated successfully',
      hall
    });
  } catch (error) {
    console.error('Hall update error:', error);
    res.status(500).json({ message: 'Error updating hall' });
  }
};

// deactivate a  hall (Admin only) 
exports.deleteHall = async (req, res) => {
  try {
    const { hallId } = req.params;

    if (!hallId || isNaN(hallId)) {
      return res.status(400).json({ message: 'Valid hall ID is required' });
    }

    const hall = await Hall.findByPk(hallId);
    
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    await hall.update({ is_active: false });

    res.status(200).json({
      message: 'Hall deleted successfully',
      hallId: hall.id
    });
  } catch (error) {
    console.error('Hall deletion error:', error);
    res.status(500).json({ message: 'Error deleting hall' });
  }
};
