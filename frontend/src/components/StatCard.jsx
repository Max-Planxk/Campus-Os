import React from 'react';

export function StatCard({ title, value, subtitle, icon, iconBg = '#EEF2FF', iconColor = '#4F46E5' }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
  );
}
