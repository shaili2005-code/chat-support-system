const logger = require('../utils/logger');

// Global error handling middleware
const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
  } else if (error.status) {
    statusCode = error.status;
    message = error.message;
  }

  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment && { 
      stack: error.stack,
      details: error.message 
    })
  });
};

// Simple 404 handler function (not middleware)
const handle404 = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    path: req.path
  });
};

module.exports = {
  errorHandler,
  handle404
};