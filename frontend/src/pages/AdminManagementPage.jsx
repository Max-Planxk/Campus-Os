import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Plus, 
  GraduationCap, 
  ShieldCheck,
  Search
} from 'lucide-react';

export function AdminManagementPage() {
  const { user, role, addToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'courses'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    studentIdOrStaffId: '',
    dateOfBirth: '',
    password: 'password123'
  });

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    code: '',
    title: '',
    department: 'Computer Science',
    semester: 'Fall 2026',
    credits: 4,
    facultyId: ''
  });

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [studentToEnrollId, setStudentToEnrollId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uList, cList] = await Promise.all([
        api.getUsers(),
        api.getAllCourses()
      ]);
      setUsers(uList);
      setCourses(cList);
      const facultyList = uList.filter(u => u.role === 'FACULTY');
      if (facultyList.length > 0) {
        setNewCourseData(prev => ({ ...prev, facultyId: facultyList[0].id }));
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error loading administrative records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(newUserData);
      addToast(`User ${newUserData.name} created successfully`, 'success');
      setIsAddUserModalOpen(false);
      setNewUserData({
        name: '',
        email: '',
        role: 'STUDENT',
        department: 'Computer Science & Engineering',
        studentIdOrStaffId: '',
        dateOfBirth: '',
        password: 'password123'
      });
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to create user', 'error');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse(newCourseData);
      addToast(`Course ${newCourseData.code} created successfully`, 'success');
      setIsAddCourseModalOpen(false);
      setNewCourseData({
        code: '',
        title: '',
        department: 'Computer Science',
        semester: 'Fall 2026',
        credits: 4,
        facultyId: users.find(u => u.role === 'FACULTY')?.id || ''
      });
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to create course', 'error');
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedCourseForEnroll || !studentToEnrollId) return;
    try {
      await api.enrollStudent(selectedCourseForEnroll.id, studentToEnrollId);
      addToast('Student successfully enrolled in course!', 'success');
      setIsEnrollModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.message || 'Enrollment failed: student may already be enrolled', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.studentIdOrStaffId && u.studentIdOrStaffId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const studentsList = users.filter(u => u.role === 'STUDENT');

  if (loading) {
    return <LoadingState message="Loading administrative console..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Campus Administration Console"
        subtitle="Full administrative control over users, academic courses, and campus-wide records"
      >
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsAddCourseModalOpen(true)}>
            <Plus size={16} />
            New Course
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          User Accounts Directory ({users.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={15} />
          Academic Courses & Enrollments ({courses.length})
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="card">
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '360px', width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name, email or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['ALL', 'STUDENT', 'FACULTY', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll / Staff ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Date of Birth</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.studentIdOrStaffId || `USER-${u.id}`}</strong></td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'ADMIN' ? 'approved' : (u.role === 'FACULTY' ? 'indigo' : 'pending')}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.department || 'General'}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {u.dateOfBirth ? (
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.dateOfBirth}</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Courses Tab */
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Active University Courses</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fall 2026 Term</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Faculty Instructor</th>
                  <th>Semester</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.title}</td>
                    <td>{c.department}</td>
                    <td>{c.credits}</td>
                    <td>{c.faculty?.name}</td>
                    <td>{c.semester}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedCourseForEnroll(c);
                          setIsEnrollModalOpen(true);
                          if (studentsList.length > 0) setStudentToEnrollId(studentsList[0].id);
                        }}
                      >
                        Enroll Student
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add Campus User Account"
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Jordan Hayes"
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. jordan@campusos.edu"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Roll / Staff ID</label>
              <input
                type="text"
                placeholder="e.g. CS2024-101"
                value={newUserData.studentIdOrStaffId}
                onChange={(e) => setNewUserData({ ...newUserData, studentIdOrStaffId: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              placeholder="e.g. Computer Science & Engineering"
              value={newUserData.department}
              onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
              required
            />
          </div>

          {newUserData.role === 'STUDENT' && (
            <div className="form-group">
              <label className="form-label">Date of Birth (YYYY-MM-DD)</label>
              <input
                type="date"
                value={newUserData.dateOfBirth}
                onChange={(e) => setNewUserData({ ...newUserData, dateOfBirth: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        title="Add New University Course"
      >
        <form onSubmit={handleCreateCourse}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS340"
                value={newCourseData.code}
                onChange={(e) => setNewCourseData({ ...newCourseData, code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Computer Networks & Protocols"
                value={newCourseData.title}
                onChange={(e) => setNewCourseData({ ...newCourseData, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                placeholder="Computer Science"
                value={newCourseData.department}
                onChange={(e) => setNewCourseData({ ...newCourseData, department: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input
                type="number"
                min="1"
                max="6"
                value={newCourseData.credits}
                onChange={(e) => setNewCourseData({ ...newCourseData, credits: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Faculty Instructor</label>
            <select
              value={newCourseData.facultyId}
              onChange={(e) => setNewCourseData({ ...newCourseData, facultyId: e.target.value })}
              required
            >
              {users.filter(u => u.role === 'FACULTY').map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.department})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddCourseModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Course
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title={`Enroll Student into ${selectedCourseForEnroll?.code}`}
      >
        <form onSubmit={handleEnrollStudent}>
          <div className="form-group">
            <label className="form-label">Select Student</label>
            <select
              value={studentToEnrollId}
              onChange={(e) => setStudentToEnrollId(e.target.value)}
              required
            >
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentIdOrStaffId}) - {s.email}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
