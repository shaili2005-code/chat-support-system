        
const Session = require('../models/Session');
const Message = require('../models/Message');
const logger = require('./logger');

const connectedUsers = new Map(); // socket.id -> { sessionId, userId, userType }

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info('Socket connection established', { socketId: socket.id });

    // Handle user/agent joining a session room
    socket.on('join_session', async (data) => {
      try {
        const { sessionId, userId, userType } = data;
        if (!sessionId || !userId || !userType) {
          return socket.emit('error', { message: 'Session ID, User ID, and User Type are required' });
        }

        // Verify the session exists in the database
        const session = await Session.findById(sessionId);
        if (!session) {
          return socket.emit('error', { message: 'Session not found' });
        }

        // Join the socket room
        socket.join(sessionId);
        connectedUsers.set(socket.id, { sessionId, userId, userType });

        logger.info(`${userType} joined session`, { socketId: socket.id, sessionId, userId });

        socket.to(sessionId).emit('user_joined', { userId, userType, timestamp: new Date() });
        socket.emit('session_joined', { sessionId, status: session.status });

      } catch (error) {
        logger.error('Error joining session', { error: error.message, data });
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle sending new messages
    socket.on('send_message', async (data) => {
      try {
        const { sessionId, message, senderId, senderType } = data;
        if (!sessionId || !message || !senderId || !senderType) {
          return socket.emit('error', { message: 'Missing required message data' });
        }

        // Verify session and authorization
        const session = await Session.findById(sessionId);
        if (!session) {
          return socket.emit('error', { message: 'Session not found' });
        }
        
        const isAuthorized = String(senderId) === String(session.userId) || String(senderId) === String(session.agentId);
        if (!isAuthorized) {
          return socket.emit('error', { message: 'Unauthorized to send message to this session' });
        }

        // Save message to the database
        const newMessage = new Message({
          sessionId,
          senderId,
          senderType,
          text: message.trim(),
        });
        await newMessage.save();
        
        // Populate sender's name for broadcasting
        await newMessage.populate('senderId', 'name');

        const broadcastPayload = {
            id: newMessage._id,
            sessionId: newMessage.sessionId,
            senderId: newMessage.senderId._id,
            senderName: newMessage.senderId.name, // Get name from populated data
            senderType: newMessage.senderType,
            message: newMessage.text,
            timestamp: newMessage.createdAt,
        };

        // Broadcast message to everyone in the session room
        io.to(sessionId).emit('new_message', broadcastPayload);
        
        // Also updating the session's last activity timestamp
        session.updatedAt = new Date();
        await session.save();

      } catch (error) {
        logger.error('Error sending message', { error: error.message, data });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators (no change needed here)
    socket.on('typing_start', (data) => {
      const { sessionId, userId, userName } = data;
      if (sessionId) {
        socket.to(sessionId).emit('user_typing', { userId, userName, isTyping: true });
      }
    });

    socket.on('typing_stop', (data) => {
      const { sessionId, userId, userName } = data;
      if (sessionId) {
        socket.to(sessionId).emit('user_typing', { userId, userName, isTyping: false });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
      const connection = connectedUsers.get(socket.id);
      if (connection) {
        const { sessionId, userId, userType } = connection;
        socket.to(sessionId).emit('user_left', { userId, userType, timestamp: new Date() });
        connectedUsers.delete(socket.id);
        logger.info(`${userType} disconnected from session`, { socketId: socket.id, sessionId, userId });
      }
    });
  });

  logger.info('Socket.IO handler initialized');
};

module.exports = socketHandler;