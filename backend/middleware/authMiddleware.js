// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      
      // Verify token - use JWT_SECRET from env or fallback to 'secretKey'
      const jwtSecret = process.env.JWT_SECRET || 'secretKey';
      const decoded = jwt.verify(token, jwtSecret);
      
      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
