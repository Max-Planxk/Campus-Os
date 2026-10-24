import React from 'react';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div className="page-header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}
