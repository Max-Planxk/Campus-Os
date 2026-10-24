import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { 
  Users, 
  Megaphone, 
  Plus, 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Crown,
  Sparkles
} from 'lucide-react';

export function ClubsPage() {
  const { user, role, addToast } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'announcements'

  // Manage memberships modal
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Post announcement modal
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState({ title: '', content: '' });

  // Create club modal (Admin only)
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState({
    name: '',
    description: '',
    category: 'Technical',
    leadId: '',
    bannerColor: '#4F46E5'
  });
  const [students, setStudents] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cList, aList] = await Promise.all([
        api.getClubs(),
        api.getAllClubAnnouncements()
      ]);
      setClubs(cList);
      setAnnouncements(aList);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to load clubs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const sList = await api.getUsers('STUDENT');
      setStudents(sList);
      if (sList.length > 0) {
        setNewClubData(prev => ({ ...prev, leadId: sList[0].id }));
      }
    } catch (err) {
      console.error('Error loading students', err);
    }
  };

  useEffect(() => {
    fetchData();
    if (role === 'ADMIN') {
      loadStudents();
    }
  }, [role]);

  const handleJoinClub = async (clubId) => {
    try {
      await api.joinClub(clubId);
      addToast('Membership request sent to club lead for approval!', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to join club', 'error');
    }
  };

  const handleOpenManageModal = async (club) => {
    setSelectedClub(club);
    setIsManageModalOpen(true);
    setLoadingMembers(true);
    try {
      const members = await api.getClubMembers(club.id, 'PENDING');
      setPendingMembers(members);
    } catch (err) {
      addToast(err.message || 'Failed to load members', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleUpdateMembership = async (membershipId, newStatus) => {
    try {
      await api.updateClubMembership(selectedClub.id, membershipId, newStatus);
      addToast(`Membership request ${newStatus.toLowerCase()}!`, 'success');
      const updated = await api.getClubMembers(selectedClub.id, 'PENDING');
      setPendingMembers(updated);
      fetchData();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedClub) return;
    try {
      await api.postClubAnnouncement(selectedClub.id, announcementData.title, announcementData.content);
      addToast('Club announcement published', 'success');
      setIsAnnouncementModalOpen(false);
      setAnnouncementData({ title: '', content: '' });
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to post announcement', 'error');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await api.createClub({
        name: newClubData.name,
        description: newClubData.description,
        category: newClubData.category,
        leadId: Number(newClubData.leadId),
        bannerColor: newClubData.bannerColor
      });
      addToast('New campus club established');
      setIsCreateClubModalOpen(false);
      setNewClubData({
        name: '',
        description: '',
        category: 'Technical',
        leadId: students[0]?.id || '',
        bannerColor: '#4F46E5'
      });
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to create club', 'error');
    }
  };

  if (loading) {
    return <LoadingState message="Loading campus clubs and societies..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Clubs & Student Societies"
        subtitle="Join technical chapters, creative guilds, and collaborate with student leaders"
      >
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {role === 'ADMIN' && (
            <button className="btn btn-primary" onClick={() => setIsCreateClubModalOpen(true)}>
              <Plus size={16} />
              New Club
            </button>
          )}
        </div>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('browse')}
        >
          <Users size={15} />
          Browse Clubs ({clubs.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'announcements' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('announcements')}
        >
          <Megaphone size={15} />
          Official Announcements ({announcements.length})
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="clubs-grid">
          {clubs.map((club) => {
            const isApproved = club.membershipStatus === 'APPROVED';
            const isPending = club.membershipStatus === 'PENDING';

            return (
              <div key={club.id} className="club-card">
                <div className="club-banner" style={{ backgroundColor: club.bannerColor || 'var(--primary)' }} />
                
                <div className="club-card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-indigo">
                      {club.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      👥 {club.memberCount} members
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem' }}>{club.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem', lineHeight: 1.5 }}>
                    {club.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <Crown size={14} style={{ color: '#D97706' }} />
                    <span>Lead: <strong>{club.lead?.name}</strong></span>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.9rem' }}>
                    {club.isLeadOrAdmin ? (
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleOpenManageModal(club)}
                        >
                          Requests ({club.pendingCount})
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedClub(club);
                            setIsAnnouncementModalOpen(true);
                          }}
                        >
                          <Megaphone size={13} />
                          Post
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <StatusBadge status={club.membershipStatus === 'NONE' ? null : club.membershipStatus} />

                        {isApproved ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                            Active Member
                          </span>
                        ) : isPending ? (
                          <span style={{ fontSize: '0.82rem', color: 'var(--warning)', fontWeight: 600 }}>
                            Review Pending
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleJoinClub(club.id)}
                          >
                            <UserPlus size={14} />
                            Join Club
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Announcements Feed */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px' }}>
          {announcements.map((ann) => (
            <div key={ann.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="badge badge-indigo">
                    {ann.club?.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    By {ann.author?.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(ann.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{ann.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Membership Requests Modal for Leads */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title={`Membership Requests: ${selectedClub?.name}`}
      >
        {loadingMembers ? (
          <LoadingState message="Fetching membership requests..." />
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Review pending student applications:
            </p>

            {pendingMembers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                No pending membership requests. All caught up!
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Department</th>
                      <th>Applied Date</th>
                      <th style={{ textAlign: 'right' }}>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMembers.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.user?.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.user?.email}</div>
                        </td>
                        <td>{m.user?.department}</td>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(m.joinedAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: 'var(--success)', color: '#fff' }}
                              onClick={() => handleUpdateMembership(m.id, 'APPROVED')}
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleUpdateMembership(m.id, 'REJECTED')}
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
      </Modal>

      {/* Post Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={`Post Announcement for ${selectedClub?.name}`}
      >
        <form onSubmit={handlePostAnnouncement}>
          <div className="form-group">
            <label className="form-label">Subject / Title</label>
            <input
              type="text"
              placeholder="e.g. Hackathon Mentorship Schedule & Room Assignments"
              value={announcementData.title}
              onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Content</label>
            <textarea
              rows={4}
              placeholder="Detailed notification for all club members..."
              value={announcementData.content}
              onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAnnouncementModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Create Club Modal */}
      <Modal
        isOpen={isCreateClubModalOpen}
        onClose={() => setIsCreateClubModalOpen(false)}
        title="Create New Campus Club / Student Chapter"
      >
        <form onSubmit={handleCreateClub}>
          <div className="form-group">
            <label className="form-label">Club Name</label>
            <input
              type="text"
              placeholder="e.g. IEEE Computational Intelligence Society"
              value={newClubData.name}
              onChange={(e) => setNewClubData({ ...newClubData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              placeholder="e.g. Technical, Robotics, Cultural, Arts"
              value={newClubData.category}
              onChange={(e) => setNewClubData({ ...newClubData, category: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Mission</label>
            <textarea
              rows={3}
              placeholder="Vision, goals, and focus areas..."
              value={newClubData.description}
              onChange={(e) => setNewClubData({ ...newClubData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student President / Lead</label>
            <select
              value={newClubData.leadId}
              onChange={(e) => setNewClubData({ ...newClubData, leadId: e.target.value })}
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department}) - {s.studentIdOrStaffId}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Theme Banner Color</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="color"
                value={newClubData.bannerColor}
                onChange={(e) => setNewClubData({ ...newClubData, bannerColor: e.target.value })}
                style={{ width: '60px', height: '40px', padding: '0', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{newClubData.bannerColor}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateClubModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Charter Club
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
