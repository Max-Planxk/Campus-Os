import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoadingState } from './components/LoadingState';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TimetablePage } from './pages/TimetablePage';
import { AttendancePage } from './pages/AttendancePage';
import { EventsPage } from './pages/EventsPage';
import { ClubsPage } from './pages/ClubsPage';
import { RoomBookingPage } from './pages/RoomBookingPage';
import { AdminManagementPage } from './pages/AdminManagementPage';
import { LoginPage } from './pages/LoginPage';
import { IntroAnimationPage } from './pages/IntroAnimationPage';

function MainApp() {
  const { user, loading, role } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Connecting to CampusOS Backend & Database..." />
      </div>
    );
  }

  if (!user) {
    if (!hasSeenIntro) {
      return <IntroAnimationPage onComplete={() => setHasSeenIntro(true)} />;
    }
    return <LoginPage onReplayIntro={() => setHasSeenIntro(false)} />;
  }

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage setCurrentTab={setCurrentTab} />;
      case 'timetable':
        return <TimetablePage />;
      case 'attendance':
        return <AttendancePage />;
      case 'events':
        return <EventsPage />;
      case 'clubs':
        return <ClubsPage />;
      case 'rooms':
        return <RoomBookingPage />;
      case 'admin':
        return role === 'ADMIN' ? <AdminManagementPage /> : <DashboardPage setCurrentTab={setCurrentTab} />;
      default:
        return <DashboardPage setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <div className="main-content">
        <TopBar />
        <main className="content-area">
          {renderActiveScreen()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
