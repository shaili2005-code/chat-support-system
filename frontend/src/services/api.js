import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: `${API_BASE}/chat`,
  headers: { 'x-api-key': API_KEY }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrap = (res) => res?.data?.data ?? res?.data ?? {};

export async function startSession({ userId, userName, userEmail = '' }) {
  const res = await api.post('/start-session', { userId, userName, userEmail });
  return unwrap(res);
}

export async function getMessages(sessionId) {
  const res = await api.get(`/messages/${sessionId}`);
  return unwrap(res);
}

// This is the correct endSession function to use
export async function endSession(sessionId) {
  const res = await api.post(`/session/${sessionId}/end`); // Corrected URL
  return unwrap(res);
}

export async function getAgentSessions(agentId, { status } = {}) {
  const res = await api.get(`/agent/${agentId}/sessions`, { params: status ? { status } : {} });
  const payload = unwrap(res);
  return Array.isArray(payload) ? payload : (payload.sessions || []);
}