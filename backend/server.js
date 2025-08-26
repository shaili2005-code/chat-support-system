require('dotenv').config();

console.log('🔍 Starting server initialization...');

try {
  console.log('📦 Loading app module...');
  const app = require('./src/app');
  console.log('✅ App module loaded successfully');

  const { createServer } = require('http');
  const { Server } = require('socket.io');
  const logger = require('./src/utils/logger');

  console.log('🌐 Creating HTTP server...');
  const server = createServer(app);
  
  console.log('🔌 Setting up Socket.IO...');
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const PORT = process.env.PORT || 5050;

  // Import socket handlers
  console.log('📡 Loading socket handlers...');
  const socketHandler = require('./src/utils/socketHandler');

  // Initialize socket handling
  console.log('🚀 Initializing socket handling...');
  socketHandler(io);

  // Start server
  console.log('🎯 Starting server...');
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  const mongoose = require('mongoose');
  console.log('🌍 Connecting to MongoDB...');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => { console.error('❌ MongoDB connection error', err); process.exit(1); });

  module.exports = { server, io };

} catch (error) {
  console.error('❌ Error during server initialization:', error.message);
  console.error('📍 Error stack:', error.stack);
  process.exit(1);
}