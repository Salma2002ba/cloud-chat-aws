import React, { useState, useEffect, useCallback } from 'react';
import { AuthSession, Room, RoomType, SidebarTheme } from './types';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import RoomCreation from './components/RoomCreation';
import Invitations from './components/Invitations';
import Profile from './components/Profile';
import MemberProfileModal from './components/MemberProfileModal';
import { api } from './services/api';
import { socket } from './services/socket';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>(() => {
    const saved = sessionStorage.getItem('chat_session');
    return saved ? 'app' : 'landing';
  });

  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = sessionStorage.getItem('chat_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [invitationCount, setInvitationCount] = useState(0);
  const [showRoomCreation, setShowRoomCreation] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);
  const [sidebarTheme, setSidebarTheme] = useState<SidebarTheme>(() => {
    return (localStorage.getItem('sidebar_theme') as SidebarTheme) || 'default';
  });

  const handleLogin = (newSession: AuthSession) => {
    setSession(newSession);
    sessionStorage.setItem('chat_session', JSON.stringify(newSession));
    setView('app');
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('chat_session');
    setSelectedRoomId(null);
    setView('landing');
  };

  const handleUpdateSidebarTheme = (theme: SidebarTheme) => {
    setSidebarTheme(theme);
    localStorage.setItem('sidebar_theme', theme);
  };

  const refreshData = useCallback(async () => {
    if (!session) return;
    try {
      const [roomList, count] = await Promise.all([
        api.rooms.list(session.user.id),
        api.invitations.count(session.user.id)
      ]);
      setRooms(roomList);
      setInvitationCount(count);

      if (!selectedRoomId && roomList.length > 0) {
        setSelectedRoomId(roomList.find(r => r.type === RoomType.GENERAL)?.id || roomList[0].id);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, [session, selectedRoomId]);

  const handleRoomDeleted = useCallback(() => {
    setSelectedRoomId(null);
    refreshData();
  }, [refreshData]);

  // Listen for real-time room events on the currently selected room
  useEffect(() => {
    if (!session || view !== 'app' || !selectedRoomId) return;

    const unsubscribe = socket.subscribeRoomEvents(
      Number(selectedRoomId),
      () => {
        // Room was deleted by owner (possibly from another client)
        setSelectedRoomId(null);
        refreshData();
      },
      () => {
        // Room was renamed
        refreshData();
      }
    );

    return () => unsubscribe();
  }, [session, view, selectedRoomId, refreshData]);

  useEffect(() => {
    if (session && view === 'app') {
      refreshData();
      const interval = setInterval(refreshData, 4000);
      return () => clearInterval(interval);
    }
  }, [session, refreshData, view]);

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('auth')} />;
  }

  if (view === 'auth' || !session) {
    return <Auth onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-indigo-100 animate-in fade-in duration-700">
      <Sidebar
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        invitationCount={invitationCount}
        onSelectRoom={setSelectedRoomId}
        onOpenRoomCreation={() => setShowRoomCreation(true)}
        onOpenInvitations={() => setShowInvitations(true)}
        onOpenProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
        user={session.user}
        currentSidebarTheme={sidebarTheme}
      />

      <main className="flex-1 flex flex-col relative bg-white/40 backdrop-blur-sm">
        {selectedRoom ? (
          <ChatWindow
            room={selectedRoom}
            currentUser={session.user}
            onRoomUpdated={refreshData}
            onRoomDeleted={handleRoomDeleted}
            onViewProfile={(uid) => setViewingMemberId(uid)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 animate-pulse">
             <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
             </div>
             <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Sélectionnez une discussion</p>
          </div>
        )}

        {showRoomCreation && (
          <RoomCreation
            userId={session.user.id}
            onClose={() => setShowRoomCreation(false)}
            onCreated={() => {
              setShowRoomCreation(false);
              refreshData();
            }}
          />
        )}

        {showInvitations && (
          <Invitations
            userId={session.user.id}
            onClose={() => setShowInvitations(false)}
            onAction={() => {
                refreshData();
            }}
          />
        )}

        {showProfile && (
            <Profile
                user={session.user}
                onClose={() => setShowProfile(false)}
                onLogout={handleLogout}
                currentSidebarTheme={sidebarTheme}
                onSidebarThemeChange={handleUpdateSidebarTheme}
            />
        )}

        {viewingMemberId && (
            <MemberProfileModal
                userId={viewingMemberId}
                currentUserId={session.user.id}
                onClose={() => setViewingMemberId(null)}
            />
        )}
      </main>
    </div>
  );
};

export default App;
