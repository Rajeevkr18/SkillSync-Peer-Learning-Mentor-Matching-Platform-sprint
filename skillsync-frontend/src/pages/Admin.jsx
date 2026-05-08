import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal States
  const [editModal, setEditModal] = useState({ show: false, type: '', data: null });
  const [createModal, setCreateModal] = useState({ show: false, type: '', data: {} });
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, pData, mData, gData, sData, skData] = await Promise.all([
        api.getAllUsers(token),
        api.getPendingMentors(token),
        api.getMentors(token),
        api.getGroups(token),
        api.getAllSessions(token),
        api.getSkills(token)
      ]);
      setUsers(uData || []);
      setPendingMentors(pData || []);
      setAllMentors(mData || []);
      setGroups(gData || []);
      setSessions(sData || []);
      setSkills(skData || []);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to load admin data' });
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await api.approveMentor(id, token);
      setMessage({ type: 'success', text: 'Mentor approved successfully' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will remove auth account and profile.')) return;
    try {
      await api.deleteUser(userId, token);
      try { await api.deleteProfile(userId, token); } catch (e) {}
      setMessage({ type: 'success', text: 'User deleted' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!window.confirm('Remove this mentor?')) return;
    try {
      await api.deleteMentor(id, token);
      setMessage({ type: 'success', text: 'Mentor removed' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await api.deleteGroup(id, token);
      setMessage({ type: 'success', text: 'Group deleted' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleCancelSession = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await api.cancelSession(id, token);
      setMessage({ type: 'success', text: 'Session cancelled' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.createSkill(newSkill, token);
      setNewSkill({ name: '', category: '' });
      setMessage({ type: 'success', text: 'Skill created' });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleEdit = (type, data) => {
    setEditModal({ show: true, type, data: { ...data } });
  };

  const handleSaveEdit = async () => {
    try {
      if (editModal.type === 'user') {
        await api.updateProfile(editModal.data.userId, editModal.data, token);
      } else if (editModal.type === 'mentor') {
        const mentorData = { ...editModal.data };
        if (typeof mentorData.skills === 'string') {
          mentorData.skills = mentorData.skills.split(',').map(s => s.trim());
        }
        await api.updateMentor(editModal.data.id, mentorData, token);
      }
      setMessage({ type: 'success', text: 'Updated successfully' });
      setEditModal({ show: false, type: '', data: null });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  const handleCreate = async () => {
    try {
      if (createModal.type === 'user') {
        await api.register(createModal.data);
      } else if (createModal.type === 'group') {
        const groupData = { ...createModal.data };
        if (typeof groupData.skills === 'string') {
          groupData.skills = groupData.skills.split(',').map(s => s.trim());
        }
        // Set a default creator if needed, or assume admin is creator
        groupData.creatorId = users.find(u => u.roles?.includes('ROLE_ADMIN'))?.userId || 1;
        await api.createGroup(groupData, token);
      } else if (createModal.type === 'mentor') {
        const mentorData = { ...createModal.data };
        if (typeof mentorData.skills === 'string') {
          mentorData.skills = mentorData.skills.split(',').map(s => s.trim());
        }
        await api.applyMentor(mentorData, token);
        // If admin is creating, maybe auto-approve?
        // await api.approveMentor(...)
      }
      setMessage({ type: 'success', text: `${createModal.type} created successfully` });
      setCreateModal({ show: false, type: '', data: {} });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  if (loading) return <div className="loading pulse">Loading Administration...</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1>Admin Control Center</h1>
            <p>Master management for Users, Mentors, Groups, and Sessions</p>
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => setCreateModal({show:true, type:'user', data:{roles:['ROLE_LEARNER']}})}>+ Add User</button>
            <button className="btn btn-secondary" onClick={() => setCreateModal({show:true, type:'group', data:{}})}>+ Create Group</button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`error ${message.type === 'success' ? 'badge-success' : ''}`} 
             style={{ backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : '', 
                      color: message.type === 'success' ? '#10b981' : '' }}>
          {message.text}
          <button onClick={() => setMessage({text:'', type:''})} style={{float:'right', background:'none', border:'none', color:'inherit', cursor:'pointer'}}>×</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer', borderColor: activeTab === 'users' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Users</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('mentors')} style={{ cursor: 'pointer', borderColor: activeTab === 'mentors' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{allMentors.length}</div>
          <div className="stat-label">Mentors ({pendingMentors.length} New)</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('groups')} style={{ cursor: 'pointer', borderColor: activeTab === 'groups' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">🏘️</div>
          <div className="stat-value">{groups.length}</div>
          <div className="stat-label">Groups</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('sessions')} style={{ cursor: 'pointer', borderColor: activeTab === 'sessions' ? 'var(--primary)' : '' }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Sessions</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'mentors' && 'Mentor Management'}
            {activeTab === 'groups' && 'Group Management'}
            {activeTab === 'sessions' && 'Session Log'}
            {activeTab === 'skills' && 'Skill Directory'}
          </h2>
          <div style={{display:'flex', gap:'10px'}}>
             {activeTab === 'mentors' && (
                <button className="btn btn-primary btn-sm" onClick={() => setCreateModal({show:true, type:'mentor', data:{}})}>+ Add Mentor</button>
             )}
             {activeTab === 'mentors' && pendingMentors.length > 0 && (
                <span className="badge badge-warning">{pendingMentors.length} Pending Apps</span>
             )}
          </div>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="table-container fade-in">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.roles?.map(r => <span key={r} className="badge badge-primary" style={{marginRight:'4px'}}>{r}</span>)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{marginRight:'8px'}} onClick={() => handleEdit('user', u)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.userId)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MENTORS TAB */}
        {activeTab === 'mentors' && (
          <div className="fade-in">
            <div className="grid-2">
              {allMentors.map(m => (
                <div key={m.id} className="card mentor-card" style={{ opacity: m.approved ? 1 : 0.8, borderLeft: m.approved ? '4px solid var(--success)' : '4px solid var(--warning)' }}>
                  <div className="mentor-header">
                    <div className="mentor-avatar">{m.name?.[0]}</div>
                    <div>
                      <div className="mentor-name">{m.name}</div>
                      <div className="mentor-exp">{m.experience} yrs exp • ${m.hourlyRate}/hr</div>
                    </div>
                    {!m.approved && <span className="badge badge-warning" style={{marginLeft:'auto'}}>Pending</span>}
                  </div>
                  <div className="mentor-skills">
                    {m.skills?.map(s => <span key={s} className="badge badge-info">{s}</span>)}
                  </div>
                  <div className="mentor-meta">
                    <div>
                      {!m.approved && (
                        <button className="btn btn-success btn-sm" style={{marginRight:'8px'}} onClick={() => handleApprove(m.id)}>Approve</button>
                      )}
                      <button className="btn btn-secondary btn-sm" style={{marginRight:'8px'}} onClick={() => handleEdit('mentor', m)}>Edit</button>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMentor(m.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <div className="table-container fade-in">
            <table>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Topic</th>
                  <th>Skills</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(g => (
                  <tr key={g.id}>
                    <td><strong>{g.name}</strong></td>
                    <td>{g.topic}</td>
                    <td>{g.skills?.map(s => <span key={s} className="badge badge-info" style={{marginRight:'4px'}}>{s}</span>)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteGroup(g.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div className="table-container fade-in">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Mentor ID</th>
                  <th>Learner ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.topic}</strong></td>
                    <td>{s.mentorId}</td>
                    <td>{s.learnerId}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACCEPTED' ? 'badge-success' : s.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                    <td>
                      {s.status !== 'CANCELLED' && (
                        <button className="btn btn-warning btn-sm" style={{marginRight:'8px'}} onClick={() => handleCancelSession(s.id)}>Cancel</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={async () => { if(window.confirm('Delete record?')) { await api.deleteSession(s.id, token); loadData(); } }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="fade-in">
             <form onSubmit={handleCreateSkill} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input type="text" className="form-input" placeholder="Skill Name" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} required />
              <input type="text" className="form-input" placeholder="Category" value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})} required />
              <button type="submit" className="btn btn-primary">Add Skill</button>
            </form>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Category</th></tr>
                </thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="badge badge-info">{s.category}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {createModal.show && (
        <div className="modal-overlay" onClick={() => setCreateModal({show:false, type:'', data:{}})}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2>Create New {createModal.type.charAt(0).toUpperCase() + createModal.type.slice(1)}</h2>
            
            {createModal.type === 'user' && (
              <>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-input" placeholder="Full Name" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, name: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-input" placeholder="email@example.com" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, email: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, password: e.target.value}})} />
                </div>
              </>
            )}

            {createModal.type === 'group' && (
              <>
                <div className="form-group">
                  <label>Group Name</label>
                  <input type="text" className="form-input" placeholder="Awesome Study Group" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, name: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Topic</label>
                  <input type="text" className="form-input" placeholder="React Advanced Hooks" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, topic: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Skills (Comma separated)</label>
                  <input type="text" className="form-input" placeholder="React, JavaScript" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, skills: e.target.value}})} />
                </div>
              </>
            )}

            {createModal.type === 'mentor' && (
              <>
                <div className="form-group">
                  <label>User ID</label>
                  <input type="number" className="form-input" placeholder="Existing User ID" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, userId: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-input" placeholder="Mentor Display Name" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, name: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input type="number" className="form-input" placeholder="50" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, hourlyRate: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Skills (Comma separated)</label>
                  <input type="text" className="form-input" placeholder="Java, Spring Boot" 
                         onChange={e => setCreateModal({...createModal, data: {...createModal.data, skills: e.target.value}})} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary btn-block" onClick={handleCreate}>Create</button>
              <button className="btn btn-secondary btn-block" onClick={() => setCreateModal({show:false, type:'', data:{}})}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.show && (
        <div className="modal-overlay" onClick={() => setEditModal({show:false, type:'', data:null})}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2>Edit {editModal.type === 'user' ? 'User Profile' : 'Mentor Details'}</h2>
            
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" value={editModal.data.name} 
                     onChange={e => setEditModal({...editModal, data: {...editModal.data, name: e.target.value}})} />
            </div>

            {editModal.type === 'user' && (
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-input" value={editModal.data.email} 
                       onChange={e => setEditModal({...editModal, data: {...editModal.data, email: e.target.value}})} />
              </div>
            )}

            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-input" value={editModal.data.bio} 
                        onChange={e => setEditModal({...editModal, data: {...editModal.data, bio: e.target.value}})} />
            </div>

            {editModal.type === 'mentor' && (
              <>
                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input type="number" className="form-input" value={editModal.data.hourlyRate} 
                         onChange={e => setEditModal({...editModal, data: {...editModal.data, hourlyRate: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" className="form-input" value={editModal.data.experience} 
                         onChange={e => setEditModal({...editModal, data: {...editModal.data, experience: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>Skills (Comma separated)</label>
                  <input type="text" className="form-input" value={Array.isArray(editModal.data.skills) ? editModal.data.skills.join(', ') : editModal.data.skills} 
                         onChange={e => setEditModal({...editModal, data: {...editModal.data, skills: e.target.value}})} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary btn-block" onClick={handleSaveEdit}>Save Changes</button>
              <button className="btn btn-secondary btn-block" onClick={() => setEditModal({show:false, type:'', data:null})}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
