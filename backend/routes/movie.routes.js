const express = require('express');
const movieController = require('../controllers/movie.controller');

const router = express.Router();

// Featured movies for hero section
router.get('/featured', movieController.getFeaturedMovies);

// Search movies
router.get('/search', movieController.searchMovies);

// Get movies with filters (main grid)
router.get('/', movieController.getMovies);

// Movie details with showtimes
router.get('/:movieId', movieController.getMovieById);

module.exports = router;
