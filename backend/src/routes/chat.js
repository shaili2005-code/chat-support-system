const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/auth');
const {
  startSession,
  getMessages,
  getSessionsForAgent,
  endSession 
} = require('../controllers/chatController');

// Applying authentication middleware to all routes
router.use(apiKeyAuth);

// --- Active Routes ---

// Starts a new session or finds an existing active one for a user
router.post('/start-session', startSession);

// Gets all messages for a given session
router.get('/messages/:sessionId', getMessages);

// Gets all sessions for a specific agent
router.get('/agent/:agentId/sessions', getSessionsForAgent);

// Marks a session as 'ended'
router.post('/session/:sessionId/end', endSession);

module.exports = router;