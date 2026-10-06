
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InvitationStatus } from '../types';

interface InvitationsProps {
  userId: string;
  onClose: () => void;
  onAction: () => void;
}

const Invitations: React.FC<InvitationsProps> = ({ userId, onClose, onAction }) => {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const data = await api.invitations.list(Number(userId));
      setInvites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [userId]);

  const handleRespond = async (id: number, status: InvitationStatus) => {
    try {
      await api.invitations.respond(id, Number(userId), status);
      fetchInvites();
      onAction();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div
        className="bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden animate-slide-up relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Style "Public Profile" */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 to-purple-700 relative flex items-center px-10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Invitations Reçues</h2>
            <button
                onClick={onClose}
                className="ml-auto bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl text-white transition-all transform active:scale-90"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recherche de demandes...</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-20 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-lg font-black text-slate-800 tracking-tight">C'est bien calme ici...</p>
                <p className="text-sm text-slate-400 font-medium">Vous n'avez aucune invitation en attente pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
                {invites.map((invite, idx) => (
                <div
                    key={invite.id}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all animate-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm font-black border border-slate-100">
                            🔒
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">
                                {invite.roomName}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                                de <span className="text-indigo-500">@{invite.inviterName}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                    <button
                        onClick={() => handleRespond(invite.id, InvitationStatus.ACCEPTED)}
                        className="p-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-90"
                        title="Accepter"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleRespond(invite.id, InvitationStatus.REJECTED)}
                        className="p-3 bg-white text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 active:scale-90"
                        title="Refuser"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>

        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {invites.length} demande{invites.length > 1 ? 's' : ''} active{invites.length > 1 ? 's' : ''}
            </p>
            <button
                onClick={onClose}
                className="text-sm font-black text-indigo-600 hover:text-indigo-800"
            >
                Fermer
            </button>
        </div>
      </div>
    </div>
  );
};

export default Invitations;
