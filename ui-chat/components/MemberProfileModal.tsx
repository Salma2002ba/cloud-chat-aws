
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PublicProfile, User, RoomType } from '../types';
import Avatar from './Avatar';

interface MemberProfileModalProps {
  userId: string;
  currentUserId: string;
  onClose: () => void;
}

const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ userId, currentUserId, onClose }) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.users.getPublicProfile(userId, currentUserId);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, currentUserId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-white p-12 rounded-3xl shadow-2xl">
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
            </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { user, commonRooms } = profile;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div
        className="bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden animate-slide-up relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-32 bg-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-90"></div>
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2 rounded-2xl text-white transition-all transform active:scale-90"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="px-10 pb-10 text-center -mt-14 relative z-10">
          <div className="inline-block relative">
            <Avatar name={user.username} size="xl" className="mx-auto ring-8 ring-white shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-500" />
            <div className="absolute bottom-6 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{user.username}</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">{user.email}</p>

          <div className="mt-10 text-left">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salons Partagés ({commonRooms.length})</h3>
                <div className="h-[1px] flex-1 bg-slate-100 ml-4"></div>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-3 custom-scrollbar">
              {commonRooms.length > 0 ? (
                commonRooms.map(room => (
                  <div key={room.id} className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors mr-4 font-black">
                      {room.type === RoomType.GENERAL ? '#' : '🔒'}
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">{room.name}</span>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium italic">Pas encore d'espaces partagés</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre Pro</p>
            <button
                onClick={onClose}
                className="text-sm font-black text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                Fermer
            </button>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileModal;
