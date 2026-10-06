
import React from 'react';
import { Room, RoomType, User, SidebarTheme } from '../types';
import Avatar from './Avatar';

interface SidebarProps {
  rooms: Room[];
  selectedRoomId: string | null;
  invitationCount: number;
  onSelectRoom: (id: string) => void;
  onOpenRoomCreation: () => void;
  onOpenInvitations: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  user: User;
  currentSidebarTheme: SidebarTheme;
}

const SIDEBAR_THEMES: Record<SidebarTheme, string> = {
  default: 'bg-gradient-to-b from-[#404eed] to-[#2c35a3]',
  ocean: 'bg-gradient-to-b from-cyan-900 to-slate-950',
  midnight: 'bg-gradient-to-b from-slate-900 to-black',
  sunset: 'bg-gradient-to-b from-rose-900 to-indigo-950',
  forest: 'bg-gradient-to-b from-emerald-900 to-slate-950',
  lavender: 'bg-gradient-to-b from-purple-900 to-slate-950'
};

const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  selectedRoomId,
  invitationCount,
  onSelectRoom,
  onOpenRoomCreation,
  onOpenInvitations,
  onOpenProfile,
  onLogout,
  user,
  currentSidebarTheme
}) => {
  const themeClass = SIDEBAR_THEMES[currentSidebarTheme] || SIDEBAR_THEMES.default;

  return (
    <aside className={`w-72 ${themeClass} text-white flex flex-col shadow-2xl z-20 border-r border-white/10 overflow-hidden transition-all duration-500`}>
      {/* Standardized Logo Section - Always Visible */}
      <div className="p-8 pb-6 flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-white text-[#404eed] rounded-xl flex items-center justify-center font-black shadow-xl transform group-hover:rotate-12 transition-transform duration-300 shrink-0">CP</div>
          <span className="text-2xl font-black tracking-tighter text-white">ChatPro</span>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth px-4 pt-4 space-y-10 custom-scrollbar-dark">
        {/* Rooms Section */}
        <div>
          <div className="flex items-center justify-between mb-4 px-3">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Mes Salons Chill</h3>
            <button
              onClick={onOpenRoomCreation}
              className="text-white/40 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2 rounded-xl transform active:scale-90"
              title="Créer un salon"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-1.5">
            {rooms.map((room, idx) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden animate-in slide-in-from-left duration-300 ${selectedRoomId === room.id ? 'bg-white/10 shadow-lg ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {selectedRoomId === room.id && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"></div>
                )}
                <span className={`mr-4 text-xl ${selectedRoomId === room.id ? 'text-white' : 'text-white/30 group-hover:text-white/60'} transition-colors`}>
                  {room.type === RoomType.GENERAL ? '#' : '🔒'}
                </span>
                <span className={`truncate flex-1 text-left ${selectedRoomId === room.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                    {room.name}
                </span>
                {selectedRoomId === room.id && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Global Actions */}
        <div>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 px-3">Espace Amis</h3>
            <button
                onClick={onOpenInvitations}
                className="w-full flex items-center px-4 py-4 rounded-2xl text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all group relative border border-transparent hover:border-white/10"
            >
                <div className="bg-white/10 p-2.5 rounded-xl mr-4 group-hover:bg-white/20 transition-all duration-300 transform group-hover:rotate-12">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <span>Invitations</span>
                {invitationCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-rose-500/40 ring-2 ring-indigo-900">
                        {invitationCount}
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 bg-black/20 border-t border-white/10 backdrop-blur-md">
        <button
            onClick={onOpenProfile}
            className="w-full flex items-center p-3.5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 transition-all group border border-white/5 shadow-xl"
        >
          <Avatar name={user.username} size="md" className="mr-3 ring-2 ring-white/10 group-hover:ring-white/30 transition-all shadow-lg" />
          <div className="flex-1 text-left">
            <p className="text-sm font-black truncate text-white">{user.username}</p>
            <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">En ligne</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-white/20 group-hover:text-white transition-all transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
