const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Autocomplete suggestions (returns movie ID + title for direct navigation)
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
