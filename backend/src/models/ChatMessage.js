const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String },
  senderType: { type: String, enum: ['user', 'agent'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
