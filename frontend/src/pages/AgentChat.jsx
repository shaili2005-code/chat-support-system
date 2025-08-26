
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMessages, getAgentSessions, endSession } from '../services/api';
import { createSocket } from '../services/socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';

export default function AgentChat() {
  const [agentId] = useState(localStorage.getItem('agentId'));
  const [agentName] = useState(localStorage.getItem('agentName'));
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingWho, setTypingWho] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [joining, setJoining] = useState(false);
  const [unread, setUnread] = useState({});

  const socket = useMemo(() => createSocket(), []);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = socket;
    return () => socket.close();
  }, [socket]);

  useEffect(() => {
    socket.on('new_message', (m) => {
      if (m.sessionId === activeSessionId) {
        setMessages(prev => [...prev, m]);
      } else {
        setUnread(prev => ({ ...prev, [m.sessionId]: (prev[m.sessionId] || 0) + 1 }));
      }
      // Refresh session list to show new message activity
      loadMyChats();
    });

    socket.on('user_typing', (p) => setTypingWho(p.isTyping ? (p.userName || 'User') : ''));
    socket.on('error', (e) => console.error('Socket error', e));
    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('error');
    };
  }, [socket, activeSessionId]);

  const loadMyChats = async () => {
    setLoadingList(true);
    try {
      const list = await getAgentSessions(agentId, { status: 'active' });
      setSessions(list || []);
      setUnread(prev => {
        const next = { ...prev };
        (list || []).forEach(s => {
          if (next[s.sessionId] == null) next[s.sessionId] = 0;
        });
        return next;
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadMyChats(); }, []);

  const joinSession = async (sessionId) => {
    if (!sessionId) return;
    setJoining(true);
    try {
      socket.emit('join_session', { sessionId, userId: agentId, userType: 'agent' });
      const data = await getMessages(sessionId);
      setMessages(data.messages || []);
      setActiveSessionId(sessionId);
      setUnread(prev => ({ ...prev, [sessionId]: 0 }));
    } finally {
      setJoining(false);
    }
  };

  const handleResolveSession = async () => {
    if (!activeSessionId) return;
    if (window.confirm('Are you sure you want to resolve this conversation?')) {
      try {
        await endSession(activeSessionId);
        setActiveSessionId('');
        setMessages([]);
        setTypingWho('');
        loadMyChats(); // Refresh the list to remove the resolved session
      } catch (error) {
        console.error('Failed to resolve session:', error);
        alert('Could not resolve the session. Please try again.');
      }
    }
  };

  const send = (text) => {
    if (!activeSessionId) return;
    socket.emit('send_message', {
      sessionId: activeSessionId,
      message: text,
      senderId: agentId,
      senderName: agentName,
      senderType: 'agent'
    });
  };

  const typingStart = () => {
    if (!activeSessionId) return;
    socket.emit('typing_start', { sessionId: activeSessionId, userId: agentId, userName: agentName });
  };

  const typingStop = () => {
    if (!activeSessionId) return;
    socket.emit('typing_stop', { sessionId: activeSessionId, userId: agentId, userName: agentName });
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="container">
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <div className="header" style={{ padding: '16px 24px', borderBottom: '1px solid #223358', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Agent Support Dashboard</div>
            <div className="small" style={{ marginTop: 4 }}>Welcome back, {agentName}. Manage your assigned conversations here.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <aside style={{ width: 320, borderRight: '1px solid #223358', padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>Assigned Conversations</div>
              <button className="primary" onClick={loadMyChats} disabled={loadingList}>
                {loadingList ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            {!sessions.length && <div className="small">No active sessions.</div>}
            {sessions.map(s => {
              const isActive = s.sessionId === activeSessionId;
              const count = unread[s.sessionId] || 0;
              return (
                <div key={s.sessionId}
                  className="card"
                  onClick={() => joinSession(s.sessionId)}
                  style={{ padding: 12, marginBottom: 10, cursor: 'pointer', borderColor: isActive ? '#4f46e5' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.userName || 'Customer'}</div>
                      {s.userEmail && <div className="small" style={{ marginTop: 2 }}>{s.userEmail}</div>}
                    </div>
                    {count > 0 && (
                      <span className="tag" style={{ background: '#4f46e5', color: '#fff' }}>{count}</span>
                    )}
                  </div>
                  <div className="small" style={{ marginTop: 6 }}>
                    {s.lastMessage?.senderName
                      ? `${s.lastMessage.senderName}: ${s.lastMessage.message.slice(0, 50)}`
                      : 'No messages yet'}
                  </div>
                  <div className="small">Updated: {new Date(s.lastActivity).toLocaleString()}</div>
                </div>
              );
            })}
          </aside>
          <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #223358', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{activeSessionId ? 'Conversation' : 'Select a conversation to start messaging'}</div>
                {!!typingWho && <div className="small" style={{ marginTop: 2 }}>{typingWho} is typing…</div>}
              </div>
              {activeSessionId && (
                <button
                  onClick={handleResolveSession}
                  className="primary"
                >
                  Resolve Conversation
                </button>
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px', overflow: 'hidden' }}>
              <MessageList messages={messages} me={{ id: agentId }} />
              <TypingIndicator who={typingWho} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #223358' }}>
              <MessageInput
                onSend={send}
                onTypingStart={typingStart}
                onTypingStop={typingStop}
                disabled={!activeSessionId || joining}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}