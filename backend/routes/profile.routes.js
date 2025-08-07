const express=require('express');
const router=express.Router();
const profileController=require('../controllers/profile.controller');
const { verifyToken } = require('../middleware/auth');

router.get("/profile",verifyToken,profileController.getUserProfile);
router.put("/profile",verifyToken,profileController.updateUserProfile);
// Instead of deleting, just deactivate as we have to maintain user data for payment booking and all
router.put('/profile/deactivate', verifyToken, profileController.deactivateAccount);

