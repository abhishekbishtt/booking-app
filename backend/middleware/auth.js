const jwt = require('jsonwebtoken');
const { BlackListedTokens } = require('../models');

// Middleware to verify JWT token and protect routes
exports.verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    //check if the token is blacklisted
    const isBlacklisted = await BlackListedTokens.findOne({ where: { token } });
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token is expired, please login again.' });
    }
    if(Math.random()<0.01){
      BlackListedTokens.destroy({
        where:{expires_at: {[Op.lt]:new Date()}}
      }).catch(console.error)         //we did not used await as we dont want to wait for this task to finish if it gets finished then its good else we skip to next function
      
      
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //this decoded contains  payload  that we passind while signing JWT and exp 
    req.token=token; //also passing token for logout
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  } 
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Access denied, only admin allowed' });
  }
  next();
};