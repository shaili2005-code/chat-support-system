const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be unassigned initially
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);