import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { 
  Users, 
  DoorOpen, 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  GraduationCap,
  Building2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export function DashboardPage({ setCurrentTab }) {
  const { user, role, addToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      addToast(err.message || 'Error fetching dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [role]);

  if (loading || !data) {
    return <LoadingState message="Loading your personalized dashboard..." />;
  }

  const handleQuickApproveBooking = async (bookingId) => {
    try {
      await api.approveBooking(bookingId);
      addToast('Room booking approved successfully');
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleQuickRejectBooking = async (bookingId) => {
    try {
      await api.rejectBooking(bookingId, 'Declined from admin dashboard');
      addToast('Room booking declined');
      fetchStats();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${user?.name}`}
        subtitle={`Role: ${role} • ${user?.department || 'Academic Division'}`}
      >
        <button 
          className="btn btn-primary"
          onClick={() => setCurrentTab(role === 'STUDENT' ? 'timetable' : (role === 'FACULTY' ? 'attendance' : 'rooms'))}
        >
          {role === 'STUDENT' ? 'View My Classes' : (role === 'FACULTY' ? 'Take Attendance' : 'Manage Campus')}
          <ArrowRight size={16} />
        </button>
      </PageHeader>

      {/* Role-Specific Metric Cards */}
      {role === 'STUDENT' && (
        <div className="stat-grid">
          <StatCard 
            title="Overall Attendance"
            value={`${data.attendanceSummary?.overallPercentage || 100}%`}
            subtitle={`${data.attendanceSummary?.totalPresent || 0} sessions attended`}
            icon={<CheckCircle2 size={24} />}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
          <StatCard 
            title="Classes Scheduled Today"
            value={data.todayClasses?.length || 0}
            subtitle="View weekly timetable"
            icon={<CalendarDays size={24} />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
          <StatCard 
            title="Active Club Memberships"
            value={data.clubsJoined || 0}
            subtitle={`${data.clubsPending || 0} pending approvals`}
            icon={<Users size={24} />}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
          <StatCard 
            title="Campus Events"
            value={data.upcomingEvents?.length || 0}
            subtitle="Hackathons & Workshops"
            icon={<Sparkles size={24} />}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
          />
        </div>
      )}

      {role === 'FACULTY' && (
        <div className="stat-grid">
          <StatCard 
            title="Classes to Teach Today"
            value={data.todayClasses?.length || 0}
            subtitle="Ready for attendance marking"
            icon={<Clock size={24} />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
          <StatCard 
            title="Assigned Courses"
            value={data.courseCount || 0}
            subtitle="Fall 2026 Academic Term"
            icon={<BookOpen size={24} />}
            iconBg="#ECFDF5"
            iconColor="#059669"
          />
          <StatCard 
            title="My Room Reservations"
            value={data.recentBookings?.length || 0}
            subtitle="Lecture halls & labs booked"
            icon={<DoorOpen size={24} />}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
          <StatCard 
            title="Upcoming Campus Events"
            value={data.upcomingEvents?.length || 0}
            subtitle="Events on academic calendar"
            icon={<Sparkles size={24} />}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
          />
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="stat-grid">
          <StatCard 
            title="Campus Attendance Rate"
            value={`${data.campusStats?.campusAttendanceRate || 92.5}%`}
            subtitle={`${data.campusStats?.totalAttendanceRecords || 0} verified records`}
            icon={<CheckCircle2 size={24} />}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
          <StatCard 
            title="Pending Room Bookings"
            value={data.campusStats?.pendingRoomBookings || 0}
            subtitle="Awaiting administrative approval"
            icon={<AlertCircle size={24} />}
            iconBg="#FEF2F2"
            iconColor="#EF4444"
          />
          <StatCard 
            title="Total Students & Faculty"
            value={`${(data.campusStats?.totalStudents || 0) + (data.campusStats?.totalFaculty || 0)}`}
            subtitle={`${data.campusStats?.totalStudents} students • ${data.campusStats?.totalFaculty} faculty`}
            icon={<Users size={24} />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
          <StatCard 
            title="Campus Rooms & Labs"
            value={data.campusStats?.totalRooms || 0}
            subtitle={`${data.campusStats?.totalCourses || 0} active courses`}
            icon={<Building2 size={24} />}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
        </div>
      )}

      {/* Main Grid: Today's Schedule & Events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.2fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Column: Today's Schedule */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Today's Classes & Sessions</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Classes scheduled for today based on real timetable data
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentTab('timetable')}
            >
              Full Timetable
            </button>
          </div>

          {data.todayClasses?.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CalendarDays size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 500 }}>No classes scheduled for today.</p>
              <span style={{ fontSize: '0.82rem' }}>Enjoy your academic study day or check the weekly timetable.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {data.todayClasses?.map((slot) => (
                <div 
                  key={slot.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{slot.course?.code}</span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{slot.course?.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>📍 Room: {slot.room?.roomNumber} ({slot.room?.building})</span>
                      <span>👨‍🏫 Faculty: {slot.faculty?.name}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    {role === 'FACULTY' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.4rem' }}
                        onClick={() => setCurrentTab('attendance')}
                      >
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Events */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Campus Events</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Workshops, hackathons & talks</p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentTab('events')}
            >
              Browse All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.upcomingEvents?.map((event) => (
              <div 
                key={event.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                      {event.category}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{event.title}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📅 {new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • 📍 {event.venueName || event.room?.roomNumber}
                  </div>
                </div>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentTab('events')}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Pending Approvals Queue (Slide 1: Module 1 Dashboard for Admins) */}
      {role === 'ADMIN' && data.pendingBookingRequests?.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color="var(--warning)" />
                Pending Room Booking Approvals ({data.pendingBookingRequests.length})
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Action needed: Approve or reject room reservations to avoid booking conflicts
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('rooms')}>
              Open Rooms Module
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Requester</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingBookingRequests.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.room?.roomNumber}</strong> ({b.room?.building})
                    </td>
                    <td>
                      {b.requester?.name}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.requester?.role}</div>
                    </td>
                    <td>
                      {b.bookingDate}
                      <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {b.startTime} - {b.endTime}
                      </div>
                    </td>
                    <td>{b.purpose}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleQuickApproveBooking(b.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleQuickRejectBooking(b.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
