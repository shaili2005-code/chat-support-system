const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Simple API Key authentication (for demo purposes)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide x-api-key header or apiKey query parameter'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};

// JWT Authentication
const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide Bearer token in Authorization header'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based middleware
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: 'Forbidden: Requires ' + role });
  }
  next();
};

// Generate JWT token (helper function)
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  apiKeyAuth,
  jwtAuth,
  generateToken,
  requireRole   //  this is exported
};
