import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { 
  DoorOpen, 
  Building, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Plus, 
  ShieldCheck,
  Tag
} from 'lucide-react';

export function RoomBookingPage() {
  const { user, role, addToast } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my' | 'admin'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Request modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [requestData, setRequestData] = useState({
    roomId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    purpose: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rList, bList, mList] = await Promise.all([
        api.getRooms(),
        api.getBookings(selectedDate),
        api.getMyBookings()
      ]);
      setRooms(rList);
      setBookings(bList);
      setMyBookings(mList);

      if (rList.length > 0 && !requestData.roomId) {
        setRequestData(prev => ({ ...prev, roomId: rList[0].id }));
      }

      if (role === 'ADMIN') {
        const pList = await api.getPendingBookings();
        setPendingBookings(pList);
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error loading rooms data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, selectedDate]);

  const handleOpenRequest = (room) => {
    setSelectedRoom(room);
    setRequestData(prev => ({
      ...prev,
      roomId: room.id,
      bookingDate: selectedDate
    }));
    setIsRequestModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend validates overlap detection strictly: "Never double-booked"
      const res = await api.createBooking({
        roomId: Number(requestData.roomId),
        bookingDate: requestData.bookingDate,
        startTime: requestData.startTime,
        endTime: requestData.endTime,
        purpose: requestData.purpose
      });
      addToast(
        role === 'ADMIN'
          ? 'Room booking approved and confirmed!'
          : 'Room request submitted to administration for approval',
        'success'
      );
      setIsRequestModalOpen(false);
      setRequestData({
        roomId: rooms[0]?.id || '',
        bookingDate: selectedDate,
        startTime: '14:00',
        endTime: '16:00',
        purpose: ''
      });
      fetchData();
    } catch (err) {
      // Overlap detection conflict returned from backend
      addToast(err.message || 'Booking conflict: room is not available at this time', 'error');
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await api.approveBooking(bookingId);
      addToast('Booking approved! Overlap checks verified.', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Approval failed: room conflict detected', 'error');
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Reason for rejecting booking:', 'Room needed for priority exam / maintenance');
    if (reason === null) return;
    try {
      await api.rejectBooking(bookingId, reason);
      addToast('Booking rejected', 'info');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this room reservation?')) return;
    try {
      await api.cancelBooking(bookingId);
      addToast('Booking cancelled');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Cancellation failed', 'error');
    }
  };

  if (loading) {
    return <LoadingState message="Loading campus rooms & reservations..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Room & Facility Bookings"
        subtitle="Lecture halls, computer labs, and seminar rooms with automated overlap detection"
      >
        <button className="btn btn-primary" onClick={() => setIsRequestModalOpen(true)}>
          <Plus size={16} />
          Request Room
        </button>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('browse')}
        >
          <Building size={15} />
          Available Rooms & Schedule
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('my')}
        >
          <Clock size={15} />
          My Reservations ({myBookings.length})
        </button>
        {role === 'ADMIN' && (
          <button
            className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('admin')}
          >
            <ShieldCheck size={15} />
            Pending Approvals ({pendingBookings.length})
          </button>
        )}
      </div>

      {/* TAB 1: Browse Rooms */}
      {activeTab === 'browse' && (
        <div>
          {/* Date Picker Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Schedule Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: 'auto', fontWeight: 600 }}
                />
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Approved bookings on {selectedDate}: <strong>{bookings.filter(b => b.status === 'APPROVED').length}</strong>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="rooms-grid">
            {rooms.map((room) => {
              const roomBookingsToday = bookings.filter(b => b.room?.id === room.id && b.status === 'APPROVED');
              return (
                <div key={room.id} className="room-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{room.roomNumber}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{room.building}</p>
                    </div>
                    <span className="badge badge-indigo">
                      {room.roomType?.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <span>👥 Capacity: <strong>{room.capacity}</strong></span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '36px', lineHeight: 1.4 }}>
                    ⚙️ {room.equipment || 'Standard classroom audio-visual setup'}
                  </div>

                  {/* Today's approved slots */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Reserved Intervals Today:
                    </div>
                    {roomBookingsToday.length === 0 ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
                        ● Available all day
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {roomBookingsToday.map((b) => (
                          <div key={b.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{b.startTime} - {b.endTime}</span>
                            <span style={{ color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{b.purpose}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => handleOpenRequest(room)}
                  >
                    Request This Room
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: My Reservations */}
      {activeTab === 'my' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>My Room Booking Requests</h3>
          {myBookings.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              You haven't requested any room bookings yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.room?.roomNumber}</strong> ({b.room?.building})
                      </td>
                      <td>{b.bookingDate}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                        {b.startTime} - {b.endTime}
                      </td>
                      <td>
                        {b.purpose}
                        {b.rejectionReason && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.15rem' }}>
                            Reason: {b.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {b.status === 'PENDING' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleCancel(b.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Admin Approvals */}
      {activeTab === 'admin' && role === 'ADMIN' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            Pending Administrative Approvals ({pendingBookings.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Backend enforces overlap prevention: Two confirmed bookings can never double-book the same room.
          </p>

          {pendingBookings.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              No pending room booking requests. Everything is processed.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Requester</th>
                    <th>Booking Date</th>
                    <th>Interval</th>
                    <th>Purpose</th>
                    <th style={{ textAlign: 'right' }}>Review Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.room?.roomNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.room?.building}</div>
                      </td>
                      <td>
                        {b.requester?.name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.requester?.role}</div>
                      </td>
                      <td>{b.bookingDate}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                        {b.startTime} - {b.endTime}
                      </td>
                      <td>{b.purpose}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm"
                            style={{ backgroundColor: 'var(--success)', color: '#fff' }}
                            onClick={() => handleApprove(b.id)}
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleReject(b.id)}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Request Room Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Room / Lab Booking"
      >
        <form onSubmit={handleBookingSubmit}>
          <div className="form-group">
            <label className="form-label">Room / Lab Facility</label>
            <select
              value={requestData.roomId}
              onChange={(e) => setRequestData({ ...requestData, roomId: e.target.value })}
              required
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.building} (Cap: {r.capacity}, {r.roomType})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Booking Date</label>
            <input
              type="date"
              value={requestData.bookingDate}
              onChange={(e) => setRequestData({ ...requestData, bookingDate: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                value={requestData.startTime}
                onChange={(e) => setRequestData({ ...requestData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                value={requestData.endTime}
                onChange={(e) => setRequestData({ ...requestData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Booking Purpose</label>
            <input
              type="text"
              placeholder="e.g. Project presentation, coding club practice, research seminar"
              value={requestData.purpose}
              onChange={(e) => setRequestData({ ...requestData, purpose: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
