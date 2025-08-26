import React, { useEffect, useMemo, useRef, useState } from 'react';
import { startSession, getMessages } from '../services/api';
import { createSocket, ensureSocketConnected } from '../services/socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';

export default function UserChat() {
  const [userId] = useState(() => localStorage.getItem('userId'));
  const [userName] = useState(() => localStorage.getItem('userName') || 'User');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingWho, setTypingWho] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  const socket = useMemo(() => createSocket(), []);
  const socketRef = useRef(null);
  useEffect(() => { socketRef.current = socket; return () => socket.close() }, [socket]);

  //Automatically find or create a session on page load 
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        const userEmail = localStorage.getItem('userEmail') || '';
        // This endpoint now finds an existing session or creates a new one
        const existingSession = await startSession({ userId, userName, userEmail });
        
        if (existingSession && existingSession.sessionId) {
          setSession(existingSession);
          // Join the socket room for real-time updates
          await ensureSocketConnected(socket);
          socket.emit('join_session', { sessionId: existingSession.sessionId, userId, userType: 'user' });
          
          // Fetch the message history for this session
          const data = await getMessages(existingSession.sessionId);
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        alert('Could not connect to chat. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [userId, userName, socket]); // Reruns if user info changes

  // Socket listeners for real-time events
  useEffect(() => {
    const onNewMessage = (m) => setMessages(prev => [...prev, m]);
    const onTyping = (p) => setTypingWho(p.isTyping ? (p.userName || 'Someone') : '');
    const onError = (e) => console.error('Socket error:', e?.message || e);

    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);
    socket.on('error', onError);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onTyping);
      socket.off('error', onError);
    };
  }, [socket]);

  const send = async (text) => {
    if (!text?.trim() || !session?.sessionId) return;
    setSending(true);
    try {
      await ensureSocketConnected(socket);
      socket.emit('send_message', {
        sessionId: session.sessionId,
        message: text.trim(),
        senderId: userId,
        senderName: userName,
        senderType: 'user',
      });
    } catch (err) {
      console.error('Send failed:', err?.message || err);
      alert('Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const typingStart = async () => {
    if (!session?.sessionId) return;
    await ensureSocketConnected(socket);
    socket.emit('typing_start', { sessionId: session.sessionId, userId, userName });
  };

  const typingStop = async () => {
    if (!session?.sessionId) return;
    await ensureSocketConnected(socket);
    socket.emit('typing_stop', { sessionId: session.sessionId, userId, userName });
  };

  const logout = () => { localStorage.clear(); window.location.href = '/' };

  return (
    <div className="container">
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <div className="header" style={{ padding: '16px 24px', borderBottom: '1px solid #223358', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Hi {userName}, how can we help you today?</div>
            {session && <div className="small" style={{ marginTop: 4 }}>You're chatting with <strong>{session.agentName || 'Support'}</strong></div>}
          </div>
          <button onClick={logout}>Logout</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chat...</div>
          ) : (
            <>
              <MessageList messages={messages} me={{ id: userId }} />
              <TypingIndicator who={typingWho} />
            </>
          )}
        </div>

        <div style={{ padding: '12px 24px' }}>
          <MessageInput
            onSend={send}
            onTypingStart={typingStart}
            onTypingStop={typingStop}
            disabled={sending || loading || !session}
          />
        </div>
      </div>
    </div>
  );
}