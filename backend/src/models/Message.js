const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'agent'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);