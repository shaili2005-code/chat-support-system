import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import UserChat from './pages/UserChat'
import AgentChat from './pages/AgentChat'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard' 

const RequireAuth = ({ children, role }) => {
  const token = localStorage.getItem('token')
  const storedRole = localStorage.getItem('userRole')
  if (!token || storedRole !== role) return <Navigate to="/" />
  return children
}

export default function RoutesDef() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/user" element={
        <RequireAuth role="user"><UserChat /></RequireAuth>
      } />
      <Route path="/agent" element={
        <RequireAuth role="agent"><AgentChat /></RequireAuth>
      } />
      <Route path="/admin" element={
        <RequireAuth role="admin"><AdminDashboard /></RequireAuth>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
