const API_BASE = 'http://localhost:8080';

const api = {
  async request(method, url, data = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);
    const res = await fetch(`${API_BASE}${url}`, config);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Auth
  login: (data) => api.request('POST', '/auth/login', data),
  register: (data) => api.request('POST', '/auth/register', data),

  // Users
  getProfile: (userId, token) => api.request('GET', `/users/${userId}`, null, token),
  updateProfile: (userId, data, token) => api.request('PUT', `/users/${userId}`, data, token),
  createProfile: (data, token) => api.request('POST', '/users', data, token),
  getAllUsers: (token) => api.request('GET', '/users', null, token),

  // Mentors
  getMentors: (token, params = '') => api.request('GET', `/mentors${params}`, null, token),
  getMentorById: (id, token) => api.request('GET', `/mentors/${id}`, null, token),
  applyMentor: (data, token) => api.request('POST', '/mentors/apply', data, token),
  approveMentor: (id, token) => api.request('PUT', `/mentors/${id}/approve`, null, token),
  getPendingMentors: (token) => api.request('GET', '/mentors/pending', null, token),
  updateAvailability: (id, data, token) => api.request('PUT', `/mentors/${id}/availability`, data, token),

  // Skills
  getSkills: (token) => api.request('GET', '/skills', null, token),
  createSkill: (data, token) => api.request('POST', '/skills', data, token),

  // Sessions
  bookSession: (data, token) => api.request('POST', '/sessions', data, token),
  getUserSessions: (userId, token) => api.request('GET', `/sessions/user/${userId}`, null, token),
  acceptSession: (id, token) => api.request('PUT', `/sessions/${id}/accept`, null, token),
  rejectSession: (id, token) => api.request('PUT', `/sessions/${id}/reject`, null, token),
  cancelSession: (id, token) => api.request('PUT', `/sessions/${id}/cancel`, null, token),

  // Groups
  getGroups: (token) => api.request('GET', '/groups', null, token),
  getGroup: (id, token) => api.request('GET', `/groups/${id}`, null, token),
  createGroup: (data, token) => api.request('POST', '/groups', data, token),
  joinGroup: (id, userId, token) => api.request('POST', `/groups/${id}/join`, { userId }, token),
  leaveGroup: (id, userId, token) => api.request('POST', `/groups/${id}/leave`, { userId }, token),

  // Reviews
  submitReview: (data, token) => api.request('POST', '/reviews', data, token),
  getMentorReviews: (mentorId, token) => api.request('GET', `/reviews/mentor/${mentorId}`, null, token),

  // Notifications
  getNotifications: (userId, token) => api.request('GET', `/notifications/user/${userId}`, null, token),
  markNotificationRead: (id, token) => api.request('PUT', `/notifications/${id}/read`, null, token),
};

export default api;
