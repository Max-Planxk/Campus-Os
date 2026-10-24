import React from 'react';

export function StatusBadge({ status }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  let className = 'badge ';
  let label = status;

  if (s === 'PRESENT' || s === 'APPROVED' || s === 'ACTIVE') {
    className += 'badge-approved';
    label = s === 'PRESENT' ? 'Present' : (s === 'APPROVED' ? 'Approved' : 'Active');
  } else if (s === 'LATE' || s === 'PENDING') {
    className += 'badge-pending';
    label = s === 'LATE' ? 'Late' : 'Pending Review';
  } else if (s === 'ABSENT' || s === 'REJECTED' || s === 'CANCELLED') {
    className += 'badge-rejected';
    label = s === 'ABSENT' ? 'Absent' : (s === 'REJECTED' ? 'Rejected' : 'Cancelled');
  } else {
    className += 'badge-indigo';
  }

  return (
    <span className={className}>
      <span style={{ fontSize: '0.65rem' }}>●</span>
      {label}
    </span>
  );
}
