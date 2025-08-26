const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')
const { jwtAuth, requireRole } = require('../middleware/auth')
const User = require('../models/User')

// Public Routes
router.post('/register', register)
router.post('/login', login)

//Agent Availability Toggle 
router.put('/:agentId/availability', jwtAuth, requireRole('agent'), async (req, res) => {
  const { agentId } = req.params
  const { available } = req.body
  try {
    const agent = await User.findById(agentId)
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ success: false, error: 'Agent not found' })
    }

    agent.status = available ? 'available' : 'offline'
    await agent.save()

    res.json({ success: true, status: agent.status })
  } catch (err) {
    console.error('Failed to update agent status', err)
    res.status(500).json({ success: false, error: 'Failed to update status' })
  }
})

//Admin-only APIs 

// Get all users (agents + users + admins)
router.get('/users', jwtAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).lean()
    res.json({ success: true, data: users })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' })
  }
})

// Delete user by ID
router.delete('/users/:id', jwtAuth, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete user' })
  }
})

module.exports = router
