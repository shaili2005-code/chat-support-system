const User = require('../models/User');
const Session = require('../models/Session');
const Message = require('../models/Message');
const logger = require('../utils/logger');

// Find the least busy, available agent
const findAvailableAgent = async () => {
  try {
    const agents = await User.aggregate([
      { $match: { role: 'agent', status: 'available' } },
      {
        $lookup: {
          from: 'sessions',
          localField: '_id',
          foreignField: 'agentId',
          as: 'sessions'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          status: 1,
          activeSessionCount: {
            $size: {
              $filter: {
                input: '$sessions',
                as: 'session',
                cond: { $eq: ['$$session.status', 'active'] }
              }
            }
          }
        }
      },
      { $sort: { activeSessionCount: 1 } },
      { $limit: 1 }
    ]);

    return agents.length > 0 ? agents[0] : null;
  } catch (error) {
    logger.error('Error finding available agent', { error: error.message });
    return null;
  }
};

// Start a new chat session or find an existing one
const startSession = async (req, res, next) => {
  try {
    const { userId, userName, userEmail } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // 1. Check if the user already has an active session
    let session = await Session.findOne({ userId, status: 'active' }).populate('agentId', 'name');
    
    if (session) {
      logger.info('Found existing active session for user', { sessionId: session._id, userId });
      return res.status(200).json({
        success: true,
        data: {
          sessionId: session._id,
          agentId: session.agentId?._id,
          agentName: session.agentId?.name || 'Waiting for an agent...',
          status: session.status,
          createdAt: session.createdAt,
        },
        message: 'Reconnected to existing session.'
      });
    }

    //  If no active session, create a new one
    const agent = await findAvailableAgent();

    const newSession = new Session({
      userId,
      agentId: agent ? agent._id : null, // Assign agent if available, otherwise null
    });

    await newSession.save();
    
    logger.info('New chat session created in DB', { sessionId: newSession._id, userId, agentId: newSession.agentId });

    res.status(201).json({
      success: true,
      data: {
        sessionId: newSession._id,
        agentId: agent?._id,
        agentName: agent?.name || 'Waiting for an agent...',
        status: newSession.status,
        createdAt: newSession.createdAt,
      },
      message: 'Chat session started successfully.'
    });

  } catch (error) {
    logger.error('Failed to start chat session', { error: error.message, userId: req.body.userId });
    next(error);
  }
};

// Get all messages for a specific session
const getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 }).lean();
    
    // Re-shape the message format to match the frontend's expectation
    const formattedMessages = messages.map(msg => ({
        id: msg._id,
        sessionId: msg.sessionId,
        senderId: msg.senderId,
        senderType: msg.senderType,
        message: msg.text, // Frontend expects 'message', not 'text'
        timestamp: msg.createdAt,
    }));

    res.json({
        success: true,
        data: {
            messages: formattedMessages
        }
    });

  } catch (error) {
    logger.error('Failed to retrieve messages', { error: error.message, sessionId: req.params.sessionId });
    next(error);
  }
};

// Get all sessions assigned to a specific agent
const getSessionsForAgent = async (req, res, next) => {
    try {
        const { agentId } = req.params;
        const { status } = req.query; // e.g., 'active' or 'ended'

        const query = { agentId };
        if (status) {
            query.status = status;
        }

        const sessions = await Session.find(query)
            .populate('userId', 'name email')
            .sort({ updatedAt: -1 })
            .lean();

        // For each session, get the last message for the preview
        const sessionsWithLastMessage = await Promise.all(
            sessions.map(async (session) => {
                const lastMessage = await Message.findOne({ sessionId: session._id })
                    .sort({ createdAt: -1 })
                    .populate('senderId', 'name')
                    .lean();
                
                return {
                    sessionId: session._id,
                    userId: session.userId._id,
                    userName: session.userId.name,
                    userEmail: session.userId.email,
                    agentId: session.agentId,
                    status: session.status,
                    lastActivity: session.updatedAt,
                    lastMessage: lastMessage ? {
                        message: lastMessage.text,
                        senderName: lastMessage.senderId.name,
                    } : null,
                };
            })
        );
        
        res.json({ success: true, data: sessionsWithLastMessage });

    } catch (error) {
        logger.error('Failed to get sessions for agent', { error: error.message, agentId: req.params.agentId });
        next(error);
    }
};

const endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'ended';
    await session.save();

    logger.info('Chat session ended', { sessionId });
    res.status(200).json({ success: true, message: 'Session has been resolved.' });

  } catch (error) {
    logger.error('Failed to end session', { error: error.message, sessionId: req.params.sessionId });
    next(error);
  }
};


module.exports = {
  startSession,
  getMessages,
  getSessionsForAgent,
  endSession, 
};