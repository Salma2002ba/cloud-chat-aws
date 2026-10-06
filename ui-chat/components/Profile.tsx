
import React, { useState } from 'react';
import { User, SidebarTheme } from '../types';
import { api } from '../services/api';
import Avatar from './Avatar';

interface ProfileProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  currentSidebarTheme: SidebarTheme;
  onSidebarThemeChange: (theme: SidebarTheme) => void;
}

const SIDEBAR_PRESETS: { id: SidebarTheme; label: string; preview: string }[] = [
  { id: 'default', label: 'Chill Blue', preview: 'bg-[#404eed]' },
  { id: 'ocean', label: 'Deep Ocean', preview: 'bg-cyan-900' },
  { id: 'midnight', label: 'Midnight', preview: 'bg-slate-900' },
  { id: 'sunset', label: 'Sunset Drive', preview: 'bg-rose-900' },
  { id: 'forest', label: 'Dark Forest', preview: 'bg-emerald-900' },
  { id: 'lavender', label: 'Lavender Dusk', preview: 'bg-purple-900' },
];

const Profile: React.FC<ProfileProps> = ({ user, onClose, onLogout, currentSidebarTheme, onSidebarThemeChange }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await api.auth.changePassword(user.id, oldPassword, newPassword);
      setStatus({ type: 'success', msg: 'Mot de passe sécurisé !' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 animate-slide-up overflow-hidden relative max-h-[90vh] overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#404eed] via-purple-500 to-pink-500"></div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Mon Univers</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-10 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center space-x-6">
          <Avatar name={user.username} size="lg" className="ring-4 ring-white shadow-xl" />
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user.username}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
          </div>
        </div>

        {/* Sidebar Theme Picker */}
        <div className="mb-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-1">Ambiance Sidebar (Dégradés Chill)</h4>
            <div className="grid grid-cols-3 gap-4">
                {SIDEBAR_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onSidebarThemeChange(preset.id)}
                        className={`group relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${currentSidebarTheme === preset.id ? 'border-[#404eed] bg-indigo-50 shadow-lg' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl mb-3 ${preset.preview} shadow-inner transition-transform group-hover:scale-110`} />
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${currentSidebarTheme === preset.id ? 'text-[#404eed]' : 'text-slate-400'}`}>
                            {preset.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-10">
            <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-1">Sécurité</h4>
                <form onSubmit={handleChangePassword} className="space-y-4">
                <input
                    type="password"
                    required
                    placeholder="Ancien mot de passe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                    type="password"
                    required
                    placeholder="Nouveau mot de passe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                {status && (
                    <p className={`text-[11px] font-black text-center px-4 py-3 rounded-2xl ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'} animate-in zoom-in uppercase tracking-widest`}>
                    {status.msg}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-[#404eed] text-white font-black rounded-2xl hover:brightness-110 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    Mettre à jour l'accès
                </button>
                </form>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <button
                    onClick={onLogout}
                    className="w-full py-4 text-rose-500 font-black text-xs hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 flex items-center justify-center space-x-2 uppercase tracking-widest"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Quitter ChatPro</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
