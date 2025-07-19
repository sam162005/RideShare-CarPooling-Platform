const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
  }

  try {
    // Remove Bearer from token string
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id || decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    
    // Set user in request
    req.user = { id: user._id };
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ success: false, msg: 'Token is not valid' });
  }
};
