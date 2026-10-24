const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('campusos_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('campusos_token', token);
  } else {
    localStorage.removeItem('campusos_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  studentRegister: (data) => request('/auth/student-register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  studentLogin: (data) => request('/auth/student-login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  staffLogin: (data) => request('/auth/staff-login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  staffRegister: (data) => request('/auth/staff-register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  adminLogin: (data) => request('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  adminRegister: (data) => request('/auth/admin-register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => request('/auth/me'),
  demoSwitch: (role, email) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (email) params.append('email', email);
    return request(`/auth/demo-switch?${params.toString()}`, { method: 'POST' });
  },
  getDemoUsers: () => request('/auth/demo-users'),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Timetable
  getTimetable: () => request('/timetable'),
  getAllTimetableSlots: () => request('/timetable/all'),
  getTodayClasses: () => request('/timetable/today'),
  checkTimetableConflicts: (payload) => request('/timetable/check-conflicts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  createTimetableSlot: (payload) => request('/timetable/slots', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  deleteTimetableSlot: (id) => request(`/timetable/slots/${id}`, {
    method: 'DELETE',
  }),

  // Attendance
  getCourseSessions: (courseId) => request(`/attendance/courses/${courseId}/sessions`),
  createSession: (payload) => request('/attendance/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getSessionSheet: (sessionId) => request(`/attendance/sessions/${sessionId}`),
  recordAttendance: (sessionId, records) => request(`/attendance/sessions/${sessionId}/records`, {
    method: 'POST',
    body: JSON.stringify(records),
  }),
  generateQrCode: (sessionId) => request(`/attendance/sessions/${sessionId}/qr-token`, {
    method: 'POST',
  }),
  qrCheckIn: (sessionId, token) => request(`/attendance/sessions/${sessionId}/qr-checkin`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
  getStudentAttendanceSummary: (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request(`/attendance/student/summary${query}`);
  },

  // Courses
  getCourses: () => request('/courses'),
  getAllCourses: () => request('/courses/all'),
  getCourseStudents: (courseId) => request(`/courses/${courseId}/students`),
  createCourse: (payload) => request('/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  enrollStudent: (courseId, studentId) => request(`/courses/${courseId}/enroll`, {
    method: 'POST',
    body: JSON.stringify({ studentId }),
  }),

  // Events
  getEvents: () => request('/events'),
  createEvent: (payload) => request('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  registerForEvent: (eventId) => request(`/events/${eventId}/register`, {
    method: 'POST',
  }),
  cancelEventRegistration: (eventId) => request(`/events/${eventId}/register`, {
    method: 'DELETE',
  }),
  getEventAttendees: (eventId) => request(`/events/${eventId}/attendees`),

  // Clubs
  getClubs: () => request('/clubs'),
  joinClub: (clubId) => request(`/clubs/${clubId}/join`, {
    method: 'POST',
  }),
  updateClubMembership: (clubId, membershipId, status) => request(`/clubs/${clubId}/memberships/${membershipId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  getClubMembers: (clubId, status) => {
    const q = status ? `?status=${status}` : '';
    return request(`/clubs/${clubId}/members${q}`);
  },
  getClubAnnouncements: (clubId) => request(`/clubs/${clubId}/announcements`),
  getAllClubAnnouncements: () => request('/clubs/announcements/all'),
  postClubAnnouncement: (clubId, title, content) => request(`/clubs/${clubId}/announcements`, {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  }),
  createClub: (payload) => request('/clubs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Rooms & Bookings
  getRooms: () => request('/rooms'),
  getBookings: (date) => {
    const q = date ? `?date=${date}` : '';
    return request(`/rooms/bookings${q}`);
  },
  getMyBookings: () => request('/rooms/bookings/my'),
  getPendingBookings: () => request('/rooms/bookings/pending'),
  createBooking: (payload) => request('/rooms/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  approveBooking: (bookingId) => request(`/rooms/bookings/${bookingId}/approve`, {
    method: 'PUT',
  }),
  rejectBooking: (bookingId, reason) => request(`/rooms/bookings/${bookingId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
  cancelBooking: (bookingId) => request(`/rooms/bookings/${bookingId}`, {
    method: 'DELETE',
  }),

  // Admin
  getUsers: (role) => {
    const q = role ? `?role=${role}` : '';
    return request(`/admin/users${q}`);
  },
  createUser: (payload) => request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
