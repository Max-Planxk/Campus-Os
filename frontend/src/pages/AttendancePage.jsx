import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  QrCode, 
  Plus, 
  Save, 
  Calendar,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export function AttendancePage() {
  const { user, role, addToast } = useAuth();

  // Faculty states
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionSheet, setSessionSheet] = useState(null);
  const [studentStatuses, setStudentStatuses] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Student states
  const [studentSummary, setStudentSummary] = useState(null);

  // Modals
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    topic: ''
  });

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeQrToken, setActiveQrToken] = useState(null);
  const [isStudentCheckInModalOpen, setIsStudentCheckInModalOpen] = useState(false);
  const [qrInputToken, setQrInputToken] = useState('');

  const [loading, setLoading] = useState(true);

  // Load faculty view
  const loadFacultyView = async () => {
    setLoading(true);
    try {
      const cList = await api.getCourses();
      setCourses(cList);
      if (cList.length > 0) {
        setSelectedCourseId(cList[0].id);
        const sList = await api.getCourseSessions(cList[0].id);
        setSessions(sList);
        if (sList.length > 0) {
          loadSessionSheet(sList[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error loading courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load student view
  const loadStudentView = async () => {
    setLoading(true);
    try {
      const summary = await api.getStudentAttendanceSummary();
      setStudentSummary(summary);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error loading attendance summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionSheet = async (sessionId) => {
    setSelectedSessionId(sessionId);
    try {
      const sheet = await api.getSessionSheet(sessionId);
      setSessionSheet(sheet);
      // Initialize statuses map
      const initialMap = {};
      sheet.students.forEach(s => {
        initialMap[s.studentId] = s.status || 'PRESENT';
      });
      setStudentStatuses(initialMap);
    } catch (err) {
      addToast(err.message || 'Error loading attendance sheet', 'error');
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId);
    setSessionSheet(null);
    try {
      const sList = await api.getCourseSessions(courseId);
      setSessions(sList);
      if (sList.length > 0) {
        loadSessionSheet(sList[0].id);
      } else {
        setSelectedSessionId(null);
      }
    } catch (err) {
      addToast(err.message || 'Error loading sessions', 'error');
    }
  };

  useEffect(() => {
    if (role === 'STUDENT') {
      loadStudentView();
    } else {
      loadFacultyView();
    }
  }, [role]);

  // Submit attendance records (POST /api/attendance/sessions/{id}/records)
  const handleSaveAttendance = async () => {
    if (!selectedSessionId) return;
    setSavingAttendance(true);
    try {
      const records = Object.keys(studentStatuses).map(studentId => ({
        studentId: Number(studentId),
        status: studentStatuses[studentId]
      }));

      // Slide 4: POST /api/attendance/sessions/{id}/records
      await api.recordAttendance(selectedSessionId, records);
      addToast('Attendance records saved successfully to database!', 'success');
      loadSessionSheet(selectedSessionId);
    } catch (err) {
      addToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createSession({
        courseId: selectedCourseId,
        sessionDate: newSessionData.sessionDate,
        topic: newSessionData.topic
      });
      addToast('New class session created');
      setIsNewSessionModalOpen(false);
      setNewSessionData({ sessionDate: new Date().toISOString().split('T')[0], topic: '' });
      
      const sList = await api.getCourseSessions(selectedCourseId);
      setSessions(sList);
      loadSessionSheet(created.id);
    } catch (err) {
      addToast(err.message || 'Failed to create session', 'error');
    }
  };

  const handleGenerateQr = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await api.generateQrCode(selectedSessionId);
      setActiveQrToken(res.qrCodeToken);
      setIsQrModalOpen(true);
      addToast('Active QR check-in session generated (Valid for 15 minutes)');
    } catch (err) {
      addToast(err.message || 'Failed to generate QR token', 'error');
    }
  };

  const handleStudentQrCheckIn = async (e) => {
    e.preventDefault();
    if (!qrInputToken.trim()) return;
    try {
      // Find today's session or default session
      await api.qrCheckIn(1, qrInputToken.trim());
      addToast('Successfully checked in as PRESENT via QR code!', 'success');
      setIsStudentCheckInModalOpen(false);
      setQrInputToken('');
      loadStudentView();
    } catch (err) {
      addToast(err.message || 'QR Check-In verification failed', 'error');
    }
  };

  if (loading) {
    return <LoadingState message="Loading attendance records..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Attendance Management"
        subtitle={
          role === 'STUDENT'
            ? 'Your verified attendance history, compliance metrics, and QR self check-in'
            : (role === 'FACULTY' 
                ? 'Mark student attendance, generate QR sessions, and review class history'
                : 'Campus-wide attendance auditing, authorized records, and session tracking')
        }
      >
        {role === 'STUDENT' ? (
          <button className="btn btn-primary" onClick={() => setIsStudentCheckInModalOpen(true)}>
            <QrCode size={16} />
            QR Self Check-In
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn btn-secondary" onClick={handleGenerateQr} disabled={!selectedSessionId}>
              <QrCode size={16} />
              Generate QR Code
            </button>
            <button className="btn btn-primary" onClick={() => setIsNewSessionModalOpen(true)}>
              <Plus size={16} />
              New Class Session
            </button>
          </div>
        )}
      </PageHeader>

      {/* ================= STUDENT VIEW ================= */}
      {role === 'STUDENT' && studentSummary && (
        <div>
          <div className="stat-grid">
            <StatCard 
              title="Overall Attendance"
              value={`${studentSummary.overallPercentage}%`}
              subtitle={studentSummary.overallPercentage >= 75 ? 'Meets 75% university criteria' : 'Below mandatory minimum'}
              icon={<CheckCircle2 size={24} />}
              iconBg="#ECFDF5"
              iconColor="#10B981"
            />
            <StatCard 
              title="Total Sessions Conducted"
              value={studentSummary.totalSessions}
              subtitle="Across all registered courses"
              icon={<Calendar size={24} />}
              iconBg="#EEF2FF"
              iconColor="#4F46E5"
            />
            <StatCard 
              title="Classes Attended (Present)"
              value={studentSummary.totalPresent}
              subtitle={`${studentSummary.totalLate} marked as Late`}
              icon={<ClipboardCheck size={24} />}
              iconBg="#FFFBEB"
              iconColor="#D97706"
            />
            <StatCard 
              title="Absences"
              value={studentSummary.totalAbsent}
              subtitle="Unexcused missed classes"
              icon={<XCircle size={24} />}
              iconBg="#FEF2F2"
              iconColor="#EF4444"
            />
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Subject-wise Attendance Breakdown</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Title</th>
                    <th>Faculty</th>
                    <th>Conducted</th>
                    <th>Present</th>
                    <th>Late</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSummary.courses?.map((c) => (
                    <tr key={c.courseId}>
                      <td><strong>{c.courseCode}</strong></td>
                      <td>{c.courseTitle}</td>
                      <td>{c.facultyName}</td>
                      <td>{c.totalSessions}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{c.presentCount}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{c.lateCount}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{c.absentCount}</td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: c.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                          {c.percentage}%
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={c.percentage >= 75 ? 'APPROVED' : 'REJECTED'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= FACULTY / ADMIN VIEW ================= */}
      {role !== 'STUDENT' && (
        <div>
          {/* Course Selector Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Selected Course:
                </span>
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => handleCourseChange(Number(e.target.value))}
                  style={{ width: 'auto', minWidth: '320px', fontWeight: 600 }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Session:
                </span>
                <select
                  value={selectedSessionId || ''}
                  onChange={(e) => loadSessionSheet(Number(e.target.value))}
                  style={{ width: 'auto', minWidth: '260px' }}
                  disabled={sessions.length === 0}
                >
                  {sessions.length === 0 ? (
                    <option value="">No sessions created yet</option>
                  ) : (
                    sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sessionDate} • {s.topic}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Attendance Marking Sheet */}
          {sessionSheet ? (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>
                    Mark Attendance: {sessionSheet.session?.topic}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Date: {sessionSheet.session?.sessionDate} • Enrolled Students: {sessionSheet.students?.length}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const allPresent = {};
                      sessionSheet.students.forEach(s => {
                        allPresent[s.studentId] = 'PRESENT';
                      });
                      setStudentStatuses(allPresent);
                    }}
                  >
                    Mark All Present
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                  >
                    <Save size={16} />
                    {savingAttendance ? 'Saving...' : 'Save Attendance Records'}
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No / ID</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Current Record</th>
                      <th style={{ textAlign: 'center' }}>Mark Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionSheet.students?.map((s) => {
                      const currentStatus = studentStatuses[s.studentId] || 'PRESENT';
                      return (
                        <tr key={s.studentId}>
                          <td><strong>{s.studentCode || `STU-${s.studentId}`}</strong></td>
                          <td>{s.studentName}</td>
                          <td>{s.studentEmail}</td>
                          <td>
                            <StatusBadge status={s.status || 'PENDING'} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className={`btn btn-sm ${currentStatus === 'PRESENT' ? 'btn-primary' : 'btn-secondary'}`}
                                style={currentStatus === 'PRESENT' ? { backgroundColor: 'var(--success)' } : {}}
                                onClick={() => setStudentStatuses({ ...studentStatuses, [s.studentId]: 'PRESENT' })}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${currentStatus === 'LATE' ? 'btn-primary' : 'btn-secondary'}`}
                                style={currentStatus === 'LATE' ? { backgroundColor: 'var(--warning)', color: '#000' } : {}}
                                onClick={() => setStudentStatuses({ ...studentStatuses, [s.studentId]: 'LATE' })}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${currentStatus === 'ABSENT' ? 'btn-primary' : 'btn-secondary'}`}
                                style={currentStatus === 'ABSENT' ? { backgroundColor: 'var(--danger)' } : {}}
                                onClick={() => setStudentStatuses({ ...studentStatuses, [s.studentId]: 'ABSENT' })}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertCircle size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600 }}>No class session selected.</p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Create a new session above to begin marking student attendance.
              </span>
            </div>
          )}
        </div>
      )}

      {/* New Session Modal */}
      <Modal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        title="Create Class Session"
      >
        <form onSubmit={handleCreateSession}>
          <div className="form-group">
            <label className="form-label">Session Date</label>
            <input
              type="date"
              value={newSessionData.sessionDate}
              onChange={(e) => setNewSessionData({ ...newSessionData, sessionDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lecture Topic / Learning Objectives</label>
            <input
              type="text"
              placeholder="e.g. Relational Calculus & Query Optimization"
              value={newSessionData.topic}
              onChange={(e) => setNewSessionData({ ...newSessionData, topic: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsNewSessionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Session
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal for Faculty */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Active QR Attendance Session"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            margin: '0 auto 1.25rem',
            padding: '1.5rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-light)',
            display: 'inline-block',
            boxShadow: 'var(--shadow-md)'
          }}>
            <QrCode size={180} style={{ color: 'var(--primary)' }} />
          </div>

          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Scan to Mark Attendance</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Students can scan or enter this one-time session verification token:
          </p>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--primary)',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'inline-block',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            {activeQrToken || 'QR-CAMPUSOS-DBMS-9942'}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
            ● Active • Expires automatically in 15 minutes
          </div>
        </div>
      </Modal>

      {/* Student QR Check-in Modal */}
      <Modal
        isOpen={isStudentCheckInModalOpen}
        onClose={() => setIsStudentCheckInModalOpen(false)}
        title="QR Code Self Check-In"
      >
        <form onSubmit={handleStudentQrCheckIn}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <QrCode size={48} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter the session token displayed by your course instructor to verify your attendance.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Session Token</label>
            <input
              type="text"
              placeholder="e.g. QR-CAMPUSOS-DBMS-9942"
              value={qrInputToken}
              onChange={(e) => setQrInputToken(e.target.value)}
              required
            />
            <span className="form-hint">Tip: Try the live demo token: QR-CAMPUSOS-DBMS-9942</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStudentCheckInModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Verify Check-In
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
