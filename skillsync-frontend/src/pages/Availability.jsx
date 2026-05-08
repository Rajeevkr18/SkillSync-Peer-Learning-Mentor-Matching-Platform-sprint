import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Availability() {
  const { user, token, isMentor } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState(null);
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });
  const [editingSlot, setEditingSlot] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isMentor()) {
      loadMentorData();
    }
  }, []);

  const loadMentorData = async () => {
    try {
      const mentors = await api.getMentors(token);
      const myMentor = mentors.find(m => m.userId === user.id);
      if (myMentor) {
        setMentor(myMentor);
        const slotsData = await api.getAvailabilitySlots(myMentor.id, token);
        setSlots(slotsData || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!mentor) return;
    try {
      await api.addAvailabilitySlot(mentor.id, newSlot, token);
      setMessage({ type: 'success', text: 'Slot added successfully!' });
      setNewSlot({ startTime: '', endTime: '' });
      loadMentorData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return;
    try {
      await api.deleteAvailabilitySlot(slotId, token);
      setMessage({ type: 'success', text: 'Slot deleted successfully!' });
      loadMentorData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    try {
      await api.updateAvailabilitySlot(editingSlot.id, editingSlot, token);
      setMessage({ type: 'success', text: 'Slot updated successfully!' });
      setEditingSlot(null);
      loadMentorData();
    } catch (e) {
      alert(e.message);
    }
  };

  if (!isMentor()) {
    return (
      <div className="empty-state">
        <div className="icon">🚫</div>
        <p>Only mentors can manage availability.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🗓️ Manage Availability</h1>
        <p>Set your available time slots for learners to book</p>
      </div>

      {message.text && (
        <div className={`badge ${message.type === 'success' ? 'badge-success' : 'badge-danger'}`} 
             style={{ marginBottom: '1rem', padding: '0.75rem', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          {message.text}
          <span style={{ cursor: 'pointer' }} onClick={() => setMessage({ type: '', text: '' })}>×</span>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">{editingSlot ? 'Edit Slot' : 'Add New Slot'}</h2>
          <form onSubmit={editingSlot ? handleUpdateSlot : handleAddSlot} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Start Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required 
                value={editingSlot ? editingSlot.startTime.slice(0, 16) : newSlot.startTime} 
                onChange={e => editingSlot ? setEditingSlot({...editingSlot, startTime: e.target.value}) : setNewSlot({...newSlot, startTime: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required 
                value={editingSlot ? editingSlot.endTime.slice(0, 16) : newSlot.endTime} 
                onChange={e => editingSlot ? setEditingSlot({...editingSlot, endTime: e.target.value}) : setNewSlot({...newSlot, endTime: e.target.value})} 
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingSlot ? 'Update Slot' : 'Add Slot'}
              </button>
              {editingSlot && (
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSlot(null)}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Your Slots</h2>
          {loading ? (
            <div className="loading pulse">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="empty-state">
              <p>No slots added yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id}>
                      <td>{new Date(slot.startTime).toLocaleString()}</td>
                      <td>{new Date(slot.endTime).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${slot.isBooked ? 'badge-warning' : 'badge-success'}`}>
                          {slot.isBooked ? 'Booked' : 'Available'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!slot.isBooked && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => setEditingSlot(slot)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSlot(slot.id)}>Delete</button>
                            </>
                          )}
                          {slot.isBooked && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
