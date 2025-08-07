const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); \
const { verifyToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout',verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// GET /api/verify-reset-token?token=abc123456 
// we can add this route for preventing of prelaoding
//  of submit new password form tho if we not implement it.. 
// it will still bne rejected by the backend its just for a minor ui thing




module.exports = router;
