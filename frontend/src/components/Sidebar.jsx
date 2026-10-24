import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ClipboardCheck, 
  Ticket, 
  Users, 
  DoorOpen, 
  ShieldCheck,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ currentTab, setCurrentTab }) {
  const { user, role, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'events', label: 'Events & Workshops', icon: Ticket },
    { id: 'clubs', label: 'Clubs & Societies', icon: Users },
    { id: 'rooms', label: 'Room Bookings', icon: DoorOpen },
  ];

  if (role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: ShieldCheck });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <GraduationCap size={24} />
        </div>
        <div className="brand-text">
          <h2>CampusOS</h2>
          <span>Unified Platform</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <span className="nav-section-title">Academic Modules</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="avatar">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Active User'}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <span className={`badge badge-${role === 'ADMIN' ? 'approved' : (role === 'FACULTY' ? 'indigo' : 'pending')}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out of CampusOS"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'var(--danger-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
