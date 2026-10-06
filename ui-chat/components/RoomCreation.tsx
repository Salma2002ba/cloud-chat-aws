
import React, { useState } from 'react';
import { api } from '../services/api';
import { RoomType } from '../types';

interface RoomCreationProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

const RoomCreation: React.FC<RoomCreationProps> = ({ userId, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<RoomType>(RoomType.PRIVATE);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.rooms.create(userId, name, type);
      onCreated();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Nouveau Salon</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-90 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nom de l'espace</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 font-bold placeholder-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              placeholder="Ex: Équipe Design"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Confidentialité</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType(RoomType.GENERAL)}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                  type === RoomType.GENERAL
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center text-xl font-black ${type === RoomType.GENERAL ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>#</div>
                <span className="text-xs font-black uppercase tracking-widest">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setType(RoomType.PRIVATE)}
                className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                  type === RoomType.PRIVATE
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center text-xl font-black ${type === RoomType.PRIVATE ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>🔒</div>
                <span className="text-xs font-black uppercase tracking-widest">Privé</span>
              </button>
            </div>
            <p className="mt-4 text-[11px] text-slate-400 font-medium px-2 leading-relaxed">
              {type === RoomType.GENERAL
                ? 'Un espace ouvert où n\'importe quel membre peut s\'exprimer librement.'
                : 'Seules les personnes munies d\'une invitation peuvent accéder aux messages.'}
            </p>
          </div>

          <div className="pt-6 flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Création en cours...' : 'Lancer le salon'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
            >
              Abandonner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomCreation;
