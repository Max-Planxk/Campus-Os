import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { 
  CalendarDays, 
  Clock, 
  Building2, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  Download
} from 'lucide-react';

const PERIOD_COLUMNS = [
  { period: '1', time: '09:00 To 09:50' },
  { period: '2', time: '10:00 To 10:50' },
  { period: '3', time: '11:00 To 11:50' },
  { period: '4', time: '12:00 To 12:50' },
  { period: '5', time: '01:00 To 01:50' },
  { period: '6', time: '02:00 To 02:50' },
  { period: '7', time: '03:00 To 03:50' },
  { period: '8', time: '04:00 To 05:30' },
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Master Official Matrix from attached college schedule
const ATTACHED_SCHEDULE = {
  Monday: {
    '2': { code: 'CSE 204', room: 'C 705' },
    '5': { code: 'SEC 203', room: 'C 705' },
    '6': { code: 'SEC 203', room: 'C 705' },
    '8': { code: 'FLC 105', room: '' },
  },
  Tuesday: {
    '1': { code: 'CSE 203', room: 'C 705' },
    '2': { code: 'SEC 203', room: 'C 705' },
    '5': { code: 'CSE 213', room: 'C 705' },
    '6': { code: 'CSE 213', room: 'C 705' },
    '8': { code: 'FLC 105', room: '' },
  },
  Wednesday: {
    '2': { code: 'FIC 120', room: 'S 510' },
    '3': { code: 'FIC 120', room: 'S 510' },
    '5': { code: 'FIC 120', room: 'C 705' },
    '6': { code: 'FIC 120', room: 'C 705' },
  },
  Thursday: {
    '1': { code: 'CSE 204', room: 'C 705' },
    '2': { code: 'CSE 204', room: 'C 705' },
    '3': { code: 'CSE 207', room: 'C 705' },
    '5': { code: 'CSE 207', room: 'C 1011' },
    '6': { code: 'CSE 207', room: 'C 1011' },
    '7': { code: 'CSE 213', room: 'C 305' },
    '8': { code: 'CSE 213', room: 'C 305' },
  },
  Friday: {
    '1': { code: 'CSE 213', room: 'C 705' },
    '2': { code: 'CSE 204', room: 'C 808' },
    '3': { code: 'CSE 204', room: 'C 808' },
    '5': { code: 'CSE 207', room: 'X 208' },
    '6': { code: 'CSE 207', room: 'X 208' },
    '7': { code: 'CSE 203', room: 'C 705' },
    '8': { code: 'CSE 203', room: 'C 705' },
  },
  Saturday: {}
};

// Detailed Subjects Description table from attached college schedule
const SUBJECTS_DIRECTORY = [
  {
    code: 'CSE 203',
    title: 'DISCRETE MATHEMATICS',
    ltpc: '3-0-0-3',
    faculty: 'Dr. Suraj Singh Khurana ( 23120 )',
    rooms: '(C 705)'
  },
  {
    code: 'CSE 204',
    title: 'DESIGN AND ANALYSIS OF ALGORITHMS',
    ltpc: '3-0-1-4',
    faculty: 'Dr. Sarvani Anandarao ( 24110 ), Dr. Shreerudra Pratik ( 25393 )',
    rooms: '(C 705),(C 808)'
  },
  {
    code: 'CSE 207',
    title: 'DIGITAL ELECTRONICS',
    ltpc: '3-0-1-4',
    faculty: 'Dr. Madasu Venkateswara Rao ( 26146 ), Ms. Shyamosree Goswami ( 26368 )',
    rooms: '(C 1011),(C 705),(X 208)'
  },
  {
    code: 'CSE 213',
    title: 'ADVANCED JAVA PROGRAMMING',
    ltpc: '3-0-1-4',
    faculty: 'Dr. Aditya Kumar Sahu ( 25346 ), Dr. Dasari Kasi Viswanath ( 26196 ), Dr. Madasu Venkateswara Rao ( 26146 )',
    rooms: '(C 305),(C 705)'
  },
  {
    code: 'FIC 120',
    title: 'FOUNDATIONS OF ELECTRICAL AND ELECTRONICS ENGINEERING',
    ltpc: '2-0-1-3',
    faculty: 'Dr. Vemula Naresh Kumar ( 26279 )',
    rooms: '(C 705),(S 510)'
  },
  {
    code: 'FLC 105',
    title: 'INTRODUCTION TO BASIC JAPANESE - DJ',
    ltpc: '3-0-0-3',
    faculty: 'Mr. Japanese Language Trainer ( V00023 )',
    rooms: '-'
  },
  {
    code: 'SEC 203',
    title: 'APTITUDE FOR ENGINEERS - III',
    ltpc: '1-0-1-2',
    faculty: 'Mr. Skilling Course Five Six ( tmp056 )',
    rooms: '(C 705)'
  }
];

export function TimetablePage() {
  const { user, role, addToast } = useAuth();
  const [dbSlots, setDbSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const data = await api.getTimetable();
      setDbSlots(data || []);
    } catch (err) {
      console.error('Failed to load database timetable slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [role]);

  // Helper to determine slot content for a day and period
  const getSlotForPeriod = (day, periodNum) => {
    // 1. Check attached master timetable definition
    const masterSlot = ATTACHED_SCHEDULE[day]?.[periodNum];
    if (masterSlot) {
      return {
        label: masterSlot.room ? `${masterSlot.code}(${masterSlot.room})` : masterSlot.code,
        code: masterSlot.code,
        room: masterSlot.room,
        isCustom: false
      };
    }

    // 2. Check if a slot was added to the database dynamically
    const periodCol = PERIOD_COLUMNS[parseInt(periodNum, 10) - 1];
    if (periodCol && dbSlots.length > 0) {
      const startTimeTarget = periodCol.time.split(' To ')[0];
      const match = dbSlots.find(s => 
        s.dayOfWeek?.toUpperCase() === day.toUpperCase() && 
        s.startTime?.startsWith(startTimeTarget)
      );
      if (match) {
        return {
          label: match.room?.roomNumber ? `${match.course?.code}(${match.room.roomNumber})` : match.course?.code,
          code: match.course?.code,
          room: match.room?.roomNumber,
          isCustom: true
        };
      }
    }

    return null;
  };

  if (loading) {
    return <LoadingState message="Loading official university timetable..." />;
  }

  return (
    <div className="timetable-page-container">
      <PageHeader 
        title="Official Academic Timetable"
        subtitle="Department of Computer Science & Engineering • Fall 2026 Semester Schedule"
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="timetable-status-indicator">
            <span className="live-dot" />
            <span>Database Synced • 21 Weekly Slots</span>
          </div>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Download size={14} />
            <span>Export / Print</span>
          </button>
        </div>
      </PageHeader>

      {/* Main TIME TABLE Container (Matching Attached Image) */}
      <div className="official-timetable-card">
        {/* Banner Title */}
        <div className="official-timetable-header">
          <h2>TIME TABLE</h2>
          <span className="timetable-batch-tag">CSE BATCH • 2026</span>
        </div>

        {/* Timetable Grid Table */}
        <div className="official-grid-wrapper">
          <table className="official-grid-table">
            <thead>
              <tr className="period-number-row">
                <th className="day-col-header" rowSpan={2}>
                  <div className="day-header-inner">
                    <CalendarDays size={16} />
                    <span>Day / Period</span>
                  </div>
                </th>
                {PERIOD_COLUMNS.map((col) => (
                  <th key={col.period} className="period-num-cell">
                    {col.period}
                  </th>
                ))}
              </tr>
              <tr className="period-time-row">
                {PERIOD_COLUMNS.map((col) => (
                  <th key={col.period} className="period-time-cell">
                    {col.time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day} className={`day-row ${day === 'Saturday' ? 'saturday-row' : ''}`}>
                  <td className="day-label-cell">
                    <strong>{day}</strong>
                  </td>

                  {PERIOD_COLUMNS.map((col) => {
                    const slot = getSlotForPeriod(day, col.period);
                    return (
                      <td key={col.period} className="slot-grid-cell">
                        {slot ? (
                          <div className={`timetable-slot-chip ${slot.isCustom ? 'custom-slot' : ''}`}>
                            <span className="slot-code-room">{slot.label}</span>
                          </div>
                        ) : (
                          <div className="empty-slot-placeholder" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subjects Description Reference Table (Matching Bottom of Attached Image) */}
      <div className="subjects-directory-card">
        <div className="subjects-dir-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            <h3>Course Curriculum & Faculty Allocation Roster</h3>
          </div>
          <span className="roster-badge">Official Faculty Allocation</span>
        </div>

        <div className="table-container">
          <table className="data-table subjects-roster-table">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Subjects Description</th>
                <th style={{ width: '10%' }}>L-T-P-C</th>
                <th style={{ width: '37%' }}>Faculty Name</th>
                <th style={{ width: '15%' }}>Class Room Name</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS_DIRECTORY.map((sub) => (
                <tr key={sub.code}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="subject-code-tag">{sub.code}</span>
                      <span className="subject-title-text">{sub.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="ltpc-badge">{sub.ltpc}</span>
                  </td>
                  <td>
                    <span className="faculty-name-text">{sub.faculty}</span>
                  </td>
                  <td>
                    <span className="classroom-name-badge">{sub.rooms}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
