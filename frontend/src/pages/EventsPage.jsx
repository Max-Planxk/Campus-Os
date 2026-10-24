import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import confetti from 'canvas-confetti';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  CheckCircle, 
  X, 
  Sparkles,
  Lock
} from 'lucide-react';

export function EventsPage() {
  const { user, role, addToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'WORKSHOP',
    eventDate: '',
    roomId: '',
    venueName: '',
    capacity: 50,
    tag: 'Technical'
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const rList = await api.getRooms();
      setRooms(rList);
      if (rList.length > 0) {
        setFormData(prev => ({ ...prev, roomId: rList[0].id }));
      }
    } catch (err) {
      console.error('Error loading rooms', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (role !== 'STUDENT') {
      loadRooms();
    }
  }, [role]);

  const handleRegister = async (eventId) => {
    try {
      await api.registerForEvent(eventId);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      addToast('Registration confirmed! See you at the event.', 'success');
      fetchEvents();
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      await api.cancelEventRegistration(eventId);
      addToast('Registration cancelled');
      fetchEvents();
    } catch (err) {
      addToast(err.message || 'Cancellation failed', 'error');
    }
  };

  const handleViewAttendees = async (event) => {
    setSelectedEvent(event);
    setIsAttendeesModalOpen(true);
    setLoadingAttendees(true);
    try {
      const list = await api.getEventAttendees(event.id);
      setAttendees(list);
    } catch (err) {
      addToast(err.message || 'Failed to load attendee list', 'error');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.createEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        eventDate: formData.eventDate,
        roomId: formData.roomId ? Number(formData.roomId) : null,
        venueName: formData.venueName,
        capacity: Number(formData.capacity),
        tag: formData.tag
      });
      addToast('Campus event published successfully');
      setIsPublishModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'WORKSHOP',
        eventDate: '',
        roomId: rooms[0]?.id || '',
        venueName: '',
        capacity: 50,
        tag: 'Technical'
      });
      fetchEvents();
    } catch (err) {
      addToast(err.message || 'Failed to publish event', 'error');
    }
  };

  const filteredEvents = activeCategory === 'ALL'
    ? events
    : events.filter(e => e.category === activeCategory);

  if (loading) {
    return <LoadingState message="Loading campus events & workshops..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Campus Events & Workshops"
        subtitle="Discover technical hackathons, hands-on workshops, and keynote lectures"
      >
        {role !== 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setIsPublishModalOpen(true)}>
            <Plus size={16} />
            Publish Event
          </button>
        )}
      </PageHeader>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {['ALL', 'HACKATHON', 'WORKSHOP', 'TECH_TALK', 'CULTURAL'].map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'ALL' ? 'All Events' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {filteredEvents.map((evt) => {
          const fillRatio = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));
          return (
            <div key={evt.id} className="event-card">
              <div className="event-card-header">
                <span className="badge badge-indigo">
                  {evt.category}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  🏷️ {evt.tag || 'Campus'}
                </span>
              </div>

              <div className="event-card-body">
                <h3>{evt.title}</h3>
                <p>{evt.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} style={{ color: 'var(--primary)' }} />
                    <span>
                      {new Date(evt.eventDate).toLocaleDateString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} style={{ color: 'var(--primary)' }} />
                    <span>{evt.venueName || (evt.room ? `${evt.room.roomNumber} (${evt.room.building})` : 'Main Campus')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={13} style={{ color: 'var(--primary)' }} />
                    <span>Organizer: <strong>{evt.organizer?.name}</strong></span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                    <span style={{ color: evt.isFull ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {evt.isFull ? 'Capacity Full' : `${evt.registeredCount} / ${evt.capacity} seats filled`}
                    </span>
                    <span>{fillRatio}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${fillRatio}%`,
                      height: '100%',
                      backgroundColor: evt.isFull ? 'var(--danger)' : (fillRatio > 80 ? 'var(--warning)' : 'var(--primary)'),
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>

              <div className="event-card-footer">
                {evt.isOrganizer && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleViewAttendees(evt)}
                  >
                    Attendees ({evt.registeredCount})
                  </button>
                )}

                <div style={{ marginLeft: 'auto' }}>
                  {evt.isRegistered ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => handleCancelRegistration(evt.id)}
                    >
                      <X size={14} />
                      Cancel Registration
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRegister(evt.id)}
                      disabled={evt.isFull}
                    >
                      {evt.isFull ? (
                        <>
                          <Lock size={14} />
                          Full
                        </>
                      ) : (
                        <>
                          <Ticket size={14} />
                          Register Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Organizer Attendees Modal */}
      <Modal
        isOpen={isAttendeesModalOpen}
        onClose={() => setIsAttendeesModalOpen(false)}
        title={`Attendees: ${selectedEvent?.title}`}
      >
        {loadingAttendees ? (
          <LoadingState message="Fetching attendee list..." />
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Total confirmed registrations: <strong>{attendees.length}</strong>
            </p>
            {attendees.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                No students registered yet.
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong></td>
                        <td>{a.email}</td>
                        <td>{a.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Publish Event Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Campus Event / Workshop"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Next-Gen Cloud Architecture Bootcamp"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="WORKSHOP">Workshop</option>
              <option value="HACKATHON">Hackathon</option>
              <option value="TECH_TALK">Tech Talk</option>
              <option value="CULTURAL">Cultural</option>
              <option value="GUEST_LECTURE">Guest Lecture</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Event curriculum, prerequisites, speaker information..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacity Limit</label>
              <input
                type="number"
                min="5"
                max="1000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue / Room</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            >
              <option value="">Custom Venue</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.building} (Capacity: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Venue Name (Optional display override)</label>
            <input
              type="text"
              placeholder="e.g. Turing Science Block - LH 101"
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
