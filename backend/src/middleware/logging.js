const logger = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: timestamp
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    
    logger.info('Response Sent', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    return originalJson.call(this, body);
  };

  next();
};

module.exports = loggingMiddleware;