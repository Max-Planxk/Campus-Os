import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, BookOpen, Database, LogOut } from 'lucide-react';

export function TopBar() {
  const { user, role, switchRole, logout } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Switch Role:
          </span>
          <div className="role-switcher-banner">
            <button
              className={`role-chip ${role === 'STUDENT' ? 'active' : ''}`}
              onClick={() => switchRole('STUDENT')}
              title="Switch to Student view (Alex Rivera)"
            >
              <UserCheck size={14} />
              <span>Student</span>
            </button>
            <button
              className={`role-chip ${role === 'FACULTY' ? 'active' : ''}`}
              onClick={() => switchRole('FACULTY')}
              title="Switch to Faculty view (Dr. Sarah Jenkins)"
            >
              <BookOpen size={14} />
              <span>Faculty</span>
            </button>
            <button
              className={`role-chip ${role === 'ADMIN' ? 'active' : ''}`}
              onClick={() => switchRole('ADMIN')}
              title="Switch to Admin view (Dean Marcus Vance)"
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-subtle)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)'
        }}>
          <Database size={13} style={{ color: 'var(--success)' }} />
          <span>Spring Data JPA • Relational DB</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.studentIdOrStaffId ? `${user.studentIdOrStaffId} • ` : ''}{user?.department || 'CampusOS User'}
          </div>
        </div>

        <div className="avatar">
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>

        <button
          className="btn btn-outline"
          onClick={logout}
          title="Sign out of CampusOS"
          style={{ 
            padding: '0.42rem 0.75rem', 
            fontSize: '0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem',
            borderColor: 'var(--border-light)',
            color: 'var(--text-secondary)'
          }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
