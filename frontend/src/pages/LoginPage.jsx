import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  User, 
  Calendar, 
  Hash, 
  Mail, 
  Lock, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  UserCheck, 
  Database,
  CheckCircle2,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

export function LoginPage({ onReplayIntro }) {
  const { 
    studentRegister, 
    studentLogin, 
    staffLogin, 
    staffRegister, 
    adminLogin, 
    adminRegister, 
    switchRole 
  } = useAuth();

  // Mode tabs: 'student', 'staff', 'admin'
  const [activeTab, setActiveTab] = useState('student');
  
  // Sub-mode toggles: 'login' | 'register'
  const [studentMode, setStudentMode] = useState('login');
  const [staffMode, setStaffMode] = useState('login');
  const [adminMode, setAdminMode] = useState('login');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Student Registration form
  const [regForm, setRegForm] = useState({
    name: '',
    collegeId: '',
    dateOfBirth: '',
    department: 'Computer Science & Engineering',
    email: '',
    password: '',
  });

  // Student Login form
  const [studentLoginForm, setStudentLoginForm] = useState({
    collegeId: '',
    dateOfBirth: '',
  });

  // Staff Login form (Database connected)
  const [staffLoginForm, setStaffLoginForm] = useState({
    identifier: '',
    password: '',
  });

  // Staff Registration form
  const [staffRegForm, setStaffRegForm] = useState({
    name: '',
    staffId: '',
    email: '',
    department: 'Computer Science & Engineering',
    password: '',
  });

  // Admin Portal Login form (Database connected)
  const [adminLoginForm, setAdminLoginForm] = useState({
    identifier: '',
    password: '',
  });

  // Admin Registration form
  const [adminRegForm, setAdminRegForm] = useState({
    name: '',
    adminId: '',
    email: '',
    department: 'Campus Administration',
    password: '',
  });

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!regForm.name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!regForm.collegeId.trim()) {
      setErrorMessage('Please enter your college ID (e.g. CS2026-042)');
      return;
    }
    if (!regForm.dateOfBirth) {
      setErrorMessage('Please enter your date of birth');
      return;
    }

    try {
      setLoading(true);
      await studentRegister({
        name: regForm.name.trim(),
        collegeId: regForm.collegeId.trim(),
        dateOfBirth: regForm.dateOfBirth,
        department: regForm.department,
        email: regForm.email.trim() || undefined,
        password: regForm.password || undefined,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentLoginForm.collegeId.trim()) {
      setErrorMessage('Please enter your college ID');
      return;
    }
    if (!studentLoginForm.dateOfBirth) {
      setErrorMessage('Please enter your date of birth');
      return;
    }

    try {
      setLoading(true);
      await studentLogin({
        collegeId: studentLoginForm.collegeId.trim(),
        dateOfBirth: studentLoginForm.dateOfBirth,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your College ID and Date of Birth.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!staffLoginForm.identifier.trim()) {
      setErrorMessage('Please enter your Staff ID or Faculty Email');
      return;
    }
    if (!staffLoginForm.password) {
      setErrorMessage('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      await staffLogin({
        identifier: staffLoginForm.identifier.trim(),
        password: staffLoginForm.password,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Staff authentication failed. Verify credentials in database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminLoginForm.identifier.trim()) {
      setErrorMessage('Please enter your Administrator ID or Email');
      return;
    }
    if (!adminLoginForm.password) {
      setErrorMessage('Please enter your administrator password');
      return;
    }

    try {
      setLoading(true);
      await adminLogin({
        identifier: adminLoginForm.identifier.trim(),
        password: adminLoginForm.password,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Admin authentication failed. Administrator privileges required.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!staffRegForm.name.trim()) {
      setErrorMessage('Please enter staff member full name');
      return;
    }
    if (!staffRegForm.staffId.trim()) {
      setErrorMessage('Please enter staff ID or employee code');
      return;
    }
    if (!staffRegForm.email.trim()) {
      setErrorMessage('Please enter faculty email address');
      return;
    }
    if (!staffRegForm.password) {
      setErrorMessage('Please set a password');
      return;
    }

    try {
      setLoading(true);
      await staffRegister({
        name: staffRegForm.name.trim(),
        staffId: staffRegForm.staffId.trim(),
        email: staffRegForm.email.trim(),
        department: staffRegForm.department,
        password: staffRegForm.password,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Staff registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminRegForm.name.trim()) {
      setErrorMessage('Please enter administrator full name');
      return;
    }
    if (!adminRegForm.adminId.trim()) {
      setErrorMessage('Please enter admin ID');
      return;
    }
    if (!adminRegForm.email.trim()) {
      setErrorMessage('Please enter administrator email address');
      return;
    }
    if (!adminRegForm.password) {
      setErrorMessage('Please enter administrator password');
      return;
    }

    try {
      setLoading(true);
      await adminRegister({
        name: adminRegForm.name.trim(),
        adminId: adminRegForm.adminId.trim(),
        email: adminRegForm.email.trim(),
        password: adminRegForm.password,
        department: adminRegForm.department,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Admin registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role, email) => {
    setErrorMessage('');
    try {
      setLoading(true);
      await switchRole(role, email);
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Dynamic ambient background glow */}
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      <div className="login-content-container">
        {/* Left hero / branding panel */}
        <div className="login-brand-panel">
          <div className="login-brand-badge">
            <GraduationCap size={28} className="brand-logo-icon" />
            <div>
              <h1 className="brand-title">CampusOS</h1>
              <span className="brand-subtitle">Unified University Ecosystem</span>
            </div>
          </div>

          <div className="login-hero-headline">
            <h2>Next-Generation Academic & Campus Operations</h2>
            <p>
              Integrated academic management with real-time course timetables, relational attendance tracking, club events, and room reservations.
            </p>
          </div>

          <div className="login-feature-list">
            <div className="login-feature-card">
              <div className="feature-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                <Database size={20} />
              </div>
              <div>
                <h4>Live Relational Database Persistence</h4>
                <p>Every student and faculty member is registered into relational tables with strict role-based constraints.</p>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="feature-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4>Official Department Timetable</h4>
                <p>Integrated 8-period weekly schedule across Blocks C, S, and X with real-time room conflict detection.</p>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="feature-icon-box" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4>Three Role-Based Portals</h4>
                <p>Dedicated database authentication for Students, Faculty/Staff, and System Administrators.</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Access Bar & Watch Intro link */}
          <div className="demo-accounts-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div className="demo-header" style={{ marginBottom: 0 }}>
                <Sparkles size={16} style={{ color: '#F59E0B' }} />
                <span>1-Click Test Access:</span>
              </div>
              {onReplayIntro && (
                <button
                  type="button"
                  className="link-text-btn"
                  onClick={onReplayIntro}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                >
                  <PlayCircle size={14} />
                  <span>Watch Intro Animation</span>
                </button>
              )}
            </div>
            <div className="demo-chips-grid">
              <button 
                type="button"
                className="demo-chip-btn"
                style={{ background: '#EFF6FF', borderColor: '#3B82F6', color: '#1D4ED8', fontWeight: 600 }}
                onClick={() => {
                  setActiveTab('admin');
                  setAdminMode('login');
                  setAdminLoginForm({
                    identifier: 'manas123@gmail.com',
                    password: '@123456789'
                  });
                }}
                disabled={loading}
              >
                <ShieldCheck size={14} style={{ color: '#2563EB' }} />
                <span>Manas (Admin)</span>
              </button>
              <button 
                type="button"
                className="demo-chip-btn"
                onClick={() => handleDemoLogin('STUDENT', 'student@campusos.edu')}
                disabled={loading}
              >
                <UserCheck size={14} />
                <span>Alex Rivera (Student)</span>
              </button>
              <button 
                type="button"
                className="demo-chip-btn"
                onClick={() => handleDemoLogin('FACULTY', 'suraj.khurana@campusos.edu')}
                disabled={loading}
              >
                <BookOpen size={14} />
                <span>Dr. Khurana (Staff 23120)</span>
              </button>
              <button 
                type="button"
                className="demo-chip-btn"
                onClick={() => handleDemoLogin('ADMIN', 'admin@campusos.edu')}
                disabled={loading}
              >
                <ShieldCheck size={14} />
                <span>Marcus Vance (Admin)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Card */}
        <div className="login-form-card">
          {/* Main 3 Portal Tabs: Student, Staff, Admin */}
          <div className="login-tab-header">
            <button
              type="button"
              id="tab-student-portal"
              className={`login-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => { setActiveTab('student'); setErrorMessage(''); }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              id="tab-staff-login"
              className={`login-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => { setActiveTab('staff'); setErrorMessage(''); }}
            >
              <BookOpen size={16} />
              <span>Staff Login</span>
            </button>
            <button
              type="button"
              id="tab-admin-login"
              className={`login-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); setErrorMessage(''); }}
            >
              <ShieldCheck size={16} />
              <span>Admin Login</span>
            </button>
          </div>

          {errorMessage && (
            <div className="auth-alert auth-alert-error">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: STUDENT PORTAL (Login or Register) */}
          {activeTab === 'student' && (
            <div>
              {/* Student Mode Switcher: Sign In vs New Register */}
              <div className="sub-mode-toggle" style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.25rem',
                marginBottom: '1.25rem',
                gap: '0.25rem'
              }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: studentMode === 'login' ? 700 : 500,
                    backgroundColor: studentMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: studentMode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: studentMode === 'login' ? 'var(--shadow-sm)' : 'none',
                  }}
                  onClick={() => { setStudentMode('login'); setErrorMessage(''); }}
                >
                  Student Login (ID & DOB)
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: studentMode === 'register' ? 700 : 500,
                    backgroundColor: studentMode === 'register' ? '#FFFFFF' : 'transparent',
                    color: studentMode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: studentMode === 'register' ? 'var(--shadow-sm)' : 'none',
                  }}
                  onClick={() => { setStudentMode('register'); setErrorMessage(''); }}
                >
                  New Student Register ✨
                </button>
              </div>

              {studentMode === 'login' ? (
                /* Student Login Form */
                <form onSubmit={handleStudentLogin} className="auth-form-body">
                  <div className="auth-form-intro">
                    <h3>Student Portal Sign In</h3>
                    <p>Enter your College ID and Date of Birth as registered in the database.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-college-id">College ID / Student ID *</label>
                    <div className="input-with-icon">
                      <Hash size={18} className="field-icon" />
                      <input
                        id="login-college-id"
                        type="text"
                        required
                        placeholder="e.g. CS2023-042 or your registered ID"
                        value={studentLoginForm.collegeId}
                        onChange={(e) => setStudentLoginForm({ ...studentLoginForm, collegeId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-dob">Date of Birth *</label>
                    <div className="input-with-icon">
                      <Calendar size={18} className="field-icon" />
                      <input
                        id="login-dob"
                        type="date"
                        required
                        value={studentLoginForm.dateOfBirth}
                        onChange={(e) => setStudentLoginForm({ ...studentLoginForm, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sample-id-hint">
                    <span>💡 Demo Student: ID: <strong>CS2023-042</strong>, DOB: <strong>2004-03-15</strong> (Alex Rivera)</span>
                  </div>

                  <button
                    type="submit"
                    id="btn-login-student"
                    className="submit-btn primary-glow-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Validating with Database...</span>
                    ) : (
                      <>
                        <span>Sign In with College ID & DOB</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Student Registration Form */
                <form onSubmit={handleStudentRegister} className="auth-form-body">
                  <div className="auth-form-intro">
                    <h3>New Student Registration</h3>
                    <p>Your details are registered directly into the university relational database.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name *</label>
                    <div className="input-with-icon">
                      <User size={18} className="field-icon" />
                      <input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="e.g. Ananya Sen"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="reg-college-id">College ID / Roll No *</label>
                      <div className="input-with-icon">
                        <Hash size={18} className="field-icon" />
                        <input
                          id="reg-college-id"
                          type="text"
                          required
                          placeholder="e.g. CS2026-105"
                          value={regForm.collegeId}
                          onChange={(e) => setRegForm({ ...regForm, collegeId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reg-dob">Date of Birth *</label>
                      <div className="input-with-icon">
                        <Calendar size={18} className="field-icon" />
                        <input
                          id="reg-dob"
                          type="date"
                          required
                          value={regForm.dateOfBirth}
                          onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-dept">Academic Department</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="field-icon" />
                      <select
                        id="reg-dept"
                        value={regForm.department}
                        onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Data Science & AI">Data Science & AI</option>
                        <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="reg-email">College Email (Optional)</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="field-icon" />
                        <input
                          id="reg-email"
                          type="email"
                          placeholder={regForm.collegeId ? `${regForm.collegeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@campusos.edu` : "Auto-generated"}
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reg-pass">Password (Optional)</label>
                      <div className="input-with-icon">
                        <Lock size={18} className="field-icon" />
                        <input
                          id="reg-pass"
                          type="password"
                          placeholder="Defaults to Date of Birth"
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="db-persistence-pill">
                    <Database size={15} style={{ color: 'var(--success)' }} />
                    <span>Persisted to database & auto-enrolled in 7 official timetable courses!</span>
                  </div>

                  <button
                    type="submit"
                    id="btn-register-student"
                    className="submit-btn primary-glow-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Saving Student Record to Database...</span>
                    ) : (
                      <>
                        <span>Register & Enter CampusOS</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: STAFF / FACULTY PORTAL (DATABASE CONNECTED) */}
          {activeTab === 'staff' && (
            <div>
              <div className="sub-mode-toggle" style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.25rem',
                marginBottom: '1.25rem',
                gap: '0.25rem'
              }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: staffMode === 'login' ? 700 : 500,
                    backgroundColor: staffMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: staffMode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: staffMode === 'login' ? 'var(--shadow-sm)' : 'none',
                  }}
                  onClick={() => { setStaffMode('login'); setErrorMessage(''); }}
                >
                  Staff Sign In
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: staffMode === 'register' ? 700 : 500,
                    backgroundColor: staffMode === 'register' ? '#FFFFFF' : 'transparent',
                    color: staffMode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: staffMode === 'register' ? 'var(--shadow-sm)' : 'none',
                  }}
                  onClick={() => { setStaffMode('register'); setErrorMessage(''); }}
                >
                  New Staff Register ✨
                </button>
              </div>

              {staffMode === 'login' ? (
                <form onSubmit={handleStaffLoginSubmit} className="auth-form-body">
                  <div className="auth-form-intro">
                    <h3>Faculty & Staff Portal</h3>
                    <p>Authenticate with your registered Staff ID or university faculty email address.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="staff-identifier">Staff ID or Faculty Email *</label>
                    <div className="input-with-icon">
                      <User size={18} className="field-icon" />
                      <input
                        id="staff-identifier"
                        type="text"
                        required
                        placeholder="Staff ID (e.g. 23120, 24110) or Email"
                        value={staffLoginForm.identifier}
                        onChange={(e) => setStaffLoginForm({ ...staffLoginForm, identifier: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="staff-password">Password *</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="staff-password"
                        type="password"
                        required
                        placeholder="Enter staff account password"
                        value={staffLoginForm.password}
                        onChange={(e) => setStaffLoginForm({ ...staffLoginForm, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sample-id-hint">
                    <span>💡 Demo Faculty: Staff ID: <strong>23120</strong> (Dr. Suraj Singh Khurana) or <strong>faculty@campusos.edu</strong>, Password: <strong>faculty123</strong></span>
                  </div>

                  <div className="db-persistence-pill">
                    <Database size={15} style={{ color: 'var(--primary)' }} />
                    <span>Connected to Database: Verifies against FACULTY role records and BCrypt hashes.</span>
                  </div>

                  <button
                    type="submit"
                    id="btn-login-staff"
                    className="submit-btn primary-glow-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Authenticating Faculty Session...</span>
                    ) : (
                      <>
                        <span>Sign In to Staff Console</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStaffRegister} className="auth-form-body">
                  <div className="auth-form-intro">
                    <h3>New Faculty / Staff Registration</h3>
                    <p>Register as a faculty member into the university database with course allocation access.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="staff-reg-name">Full Name *</label>
                    <div className="input-with-icon">
                      <User size={18} className="field-icon" />
                      <input
                        id="staff-reg-name"
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Verma"
                        value={staffRegForm.name}
                        onChange={(e) => setStaffRegForm({ ...staffRegForm, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="staff-reg-id">Staff ID / Code *</label>
                      <div className="input-with-icon">
                        <Hash size={18} className="field-icon" />
                        <input
                          id="staff-reg-id"
                          type="text"
                          required
                          placeholder="e.g. FAC-29001"
                          value={staffRegForm.staffId}
                          onChange={(e) => setStaffRegForm({ ...staffRegForm, staffId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="staff-reg-email">Official Email *</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="field-icon" />
                        <input
                          id="staff-reg-email"
                          type="email"
                          required
                          placeholder="name@campusos.edu"
                          value={staffRegForm.email}
                          onChange={(e) => setStaffRegForm({ ...staffRegForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="staff-reg-dept">Academic Department *</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="field-icon" />
                      <select
                        id="staff-reg-dept"
                        value={staffRegForm.department}
                        onChange={(e) => setStaffRegForm({ ...staffRegForm, department: e.target.value })}
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Data Science & AI">Data Science & AI</option>
                        <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="staff-reg-pass">Password *</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="staff-reg-pass"
                        type="password"
                        required
                        placeholder="Set strong staff password"
                        value={staffRegForm.password}
                        onChange={(e) => setStaffRegForm({ ...staffRegForm, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="db-persistence-pill">
                    <Database size={15} style={{ color: 'var(--success)' }} />
                    <span>Persisted to database with encrypted BCrypt password and FACULTY role privileges.</span>
                  </div>

                  <button
                    type="submit"
                    id="btn-register-staff"
                    className="submit-btn primary-glow-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Registering Staff Member...</span>
                    ) : (
                      <>
                        <span>Register Staff Member</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN PORTAL (DATABASE CONNECTED) */}
          {activeTab === 'admin' && (
            <div>
              <div className="sub-mode-toggle" style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.25rem',
                marginBottom: '1.25rem',
                gap: '0.25rem'
              }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: adminMode === 'login' ? 700 : 500,
                    backgroundColor: adminMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: adminMode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: adminMode === 'login' ? 'var(--shadow-sm)' : 'none',
                  }}
                  onClick={() => { setAdminMode('login'); setErrorMessage(''); }}
                >
                  Administrator Sign In
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: adminMode === 'register' ? 700 : 500,
                    backgroundColor: adminMode === 'register' ? '#FFFFFF' : 'transparent',
                    color: adminMode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: adminMode === 'register' ? 'var(--shadow-sm)' : 'none',
                  }}
                  onClick={() => { setAdminMode('register'); setErrorMessage(''); }}
                >
                  Register Administrator ✨
                </button>
              </div>

              {adminMode === 'login' ? (
                <form onSubmit={handleAdminLoginSubmit} className="auth-form-body">
                  <div className="auth-form-intro">
                    <h3>System Administration Portal</h3>
                    <p>Privileged console for Deans, Academic Directors, and Campus IT Administrators.</p>
                  </div>

                  {/* Prominent Manas Admin Callout */}
                  <div style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.08)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={16} style={{ color: '#16A34A' }} />
                        <span>Manas (System Administrator)</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '0.2rem' }}>
                        Email: <strong>manas123@gmail.com</strong> • Pass: <strong>@123456789</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.35rem 0.65rem',
                        borderColor: '#22C55E',
                        color: '#15803D',
                        background: '#FFFFFF',
                        fontWeight: 600
                      }}
                      onClick={() => setAdminLoginForm({ identifier: 'manas123@gmail.com', password: '@123456789' })}
                    >
                      Auto-Fill
                    </button>
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-identifier">Admin ID or University Email *</label>
                    <div className="input-with-icon">
                      <ShieldCheck size={18} className="field-icon" />
                      <input
                        id="admin-identifier"
                        type="text"
                        required
                        placeholder="Admin Email (manas123@gmail.com) or ID"
                        value={adminLoginForm.identifier}
                        onChange={(e) => setAdminLoginForm({ ...adminLoginForm, identifier: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-password">Administrator Password *</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="admin-password"
                        type="password"
                        required
                        placeholder="Enter administrator password (@123456789)"
                        value={adminLoginForm.password}
                        onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="db-persistence-pill">
                    <Database size={15} style={{ color: 'var(--warning)' }} />
                    <span>Connected to Database: Strictly enforces ADMIN role security filter chains.</span>
                  </div>

                  <button
                    type="submit"
                    id="btn-login-admin"
                    className="submit-btn primary-glow-btn"
                    style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Authorizing Admin Credentials...</span>
                    ) : (
                      <>
                        <span>Authorize Admin Session</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminRegister} className="auth-form-body">
                  <div className="auth-form-intro">
                    <h3>Register New Administrator</h3>
                    <p>Grant full system administration rights. Saved directly into the database users table.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-reg-name">Administrator Full Name *</label>
                    <div className="input-with-icon">
                      <User size={18} className="field-icon" />
                      <input
                        id="admin-reg-name"
                        type="text"
                        required
                        placeholder="e.g. Manas"
                        value={adminRegForm.name}
                        onChange={(e) => setAdminRegForm({ ...adminRegForm, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="admin-reg-id">Admin ID / Badge *</label>
                      <div className="input-with-icon">
                        <Hash size={18} className="field-icon" />
                        <input
                          id="admin-reg-id"
                          type="text"
                          required
                          placeholder="e.g. ADM-002"
                          value={adminRegForm.adminId}
                          onChange={(e) => setAdminRegForm({ ...adminRegForm, adminId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="admin-reg-email">Admin Email *</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="field-icon" />
                        <input
                          id="admin-reg-email"
                          type="email"
                          required
                          placeholder="admin@campusos.edu"
                          value={adminRegForm.email}
                          onChange={(e) => setAdminRegForm({ ...adminRegForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-reg-dept">Administrative Unit</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="field-icon" />
                      <input
                        id="admin-reg-dept"
                        type="text"
                        placeholder="Campus Administration & Technology"
                        value={adminRegForm.department}
                        onChange={(e) => setAdminRegForm({ ...adminRegForm, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-reg-pass">Password *</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="field-icon" />
                      <input
                        id="admin-reg-pass"
                        type="password"
                        required
                        placeholder="Set administrator password"
                        value={adminRegForm.password}
                        onChange={(e) => setAdminRegForm({ ...adminRegForm, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="db-persistence-pill">
                    <Database size={15} style={{ color: 'var(--success)' }} />
                    <span>Saved to database with ADMIN role authority.</span>
                  </div>

                  <button
                    type="submit"
                    id="btn-register-admin"
                    className="submit-btn primary-glow-btn"
                    style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Saving Admin Account to Database...</span>
                    ) : (
                      <>
                        <span>Register Administrator</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
