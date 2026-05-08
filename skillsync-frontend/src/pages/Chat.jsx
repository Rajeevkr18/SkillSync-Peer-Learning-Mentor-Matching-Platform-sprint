import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

export default function Chat() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const query = new URLSearchParams(window.location.search);
  const initialRoom = query.get('room') || 'global';
  const shouldAnnounce = query.get('joined') === 'true';
  
  const [roomId, setRoomId] = useState(initialRoom);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:8089');
    socketRef.current.emit('join_room', roomId);

    // If we just joined from the Groups page, send a broadcast message
    if (shouldAnnounce) {
      const data = {
        roomId,
        senderId: 'system',
        senderName: 'SkillSync',
        message: `${user.name} has joined the group! 👋`,
        timestamp: new Date().toISOString(),
        isSystem: true
      };
      socketRef.current.emit('send_message', data);
      
      // Remove the 'joined' flag from URL to prevent resending on refresh
      window.history.replaceState(null, '', window.location.pathname + `?room=${roomId}`);
    }

    socketRef.current.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const data = {
      roomId,
      senderId: user.id,
      senderName: user.name,
      message,
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit('send_message', data);
    setMessage('');
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1>💬 Live Chat</h1>
        <p>Coordinate with your mentors and learners in real-time</p>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-input)' }}>
          <span className="badge badge-primary">Room: {roomId}</span>
        </div>

        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.senderId === 'system' ? 'center' : (m.senderId === user.id ? 'flex-end' : 'flex-start'),
                maxWidth: m.senderId === 'system' ? '90%' : '70%',
                padding: m.senderId === 'system' ? '0.5rem 1rem' : '0.75rem 1rem',
                borderRadius: '12px',
                background: m.senderId === 'system' ? 'rgba(99, 102, 241, 0.1)' : (m.senderId === user.id ? 'var(--primary)' : 'var(--bg-input)'),
                color: m.senderId === 'system' ? 'var(--primary-light)' : 'white',
                border: m.senderId === 'system' ? '1px dashed var(--primary-glow)' : 'none',
                position: 'relative',
                textAlign: m.senderId === 'system' ? 'center' : 'left',
                fontSize: m.senderId === 'system' ? '0.8rem' : '0.9rem',
                fontStyle: m.senderId === 'system' ? 'italic' : 'normal'
              }}>
                {m.senderId !== 'system' && (
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                    {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div>{m.message}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: '1rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Type a message..." 
            value={message} 
            onChange={e => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}
