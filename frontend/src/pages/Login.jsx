
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // The role state defaults to 'user', so the logic remains correct
  const [role, setRole] = useState('user') 
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const persistUser = ({ token, user }) => {
    if (token) localStorage.setItem('token', token)
    localStorage.setItem('userId', user.id)
    localStorage.setItem('userName', user.name || '')
    localStorage.setItem('userEmail', user.email || '')
    localStorage.setItem('userRole', user.role || '')

    if (user.role === 'agent') {
      localStorage.setItem('agentId', user.id)
      localStorage.setItem('agentName', user.name || 'Agent')
    }
  }

  const doLogin = async (creds) => {
    const res = await axios.post(`${API_BASE}/auth/login`, creds)
    const { token, user } = res.data
    persistUser({ token, user })

    if (user.role === 'admin') {
      nav('/admin')
    } else if (user.role === 'agent') {
      nav('/agent')
    } else {
      nav('/user')
    }
  }

  const handleAuth = async () => {
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await axios.post(`${API_BASE}/auth/register`, { name, email, password, role })
        await doLogin({ email, password })
      } else {
        await doLogin({ email, password })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
        className="container" 
        style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}
    >
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <h2 style={{ marginBottom: 8 }}>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
        <p className="small" style={{ marginTop: 0, marginBottom: 16 }}>
          {isRegister
            ? 'Register to start a real-time chat with our support team.'
            : 'Sign in to access your chat dashboard.'}
        </p>

        {error && (
          <div className="small" style={{ color: 'salmon', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div className="row" style={{ flexDirection: 'column', gap: 10 }}>
          {isRegister && (
            
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
            
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary" onClick={handleAuth} disabled={loading}>
            {loading ? (isRegister ? 'Creating…' : 'Signing in…') : (isRegister ? 'Register' : 'Login')}
          </button>

          <div className="small" style={{ marginTop: 10, textAlign: 'center' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: 'var(--brand)', cursor: 'pointer' }}
            >
              {isRegister ? 'Login' : 'Register'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}