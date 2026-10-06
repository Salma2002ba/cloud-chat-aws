
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Room, User, Message, RoomType, RoomTheme } from '../types';
import { api } from '../services/api';
import { socket } from '../services/socket';
import Avatar from './Avatar';

interface ChatWindowProps {
  room: Room;
  currentUser: User;
  onRoomUpdated: () => void;
  onRoomDeleted: () => void;
  onViewProfile: (userId: string) => void;
}

const THEMES: { id: RoomTheme; color: string; bg: string; text: string; shadow: string }[] = [
  { id: 'indigo', color: 'bg-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600', shadow: 'shadow-indigo-200' },
  { id: 'rose', color: 'bg-rose-600', bg: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-200' },
  { id: 'emerald', color: 'bg-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-200' },
  { id: 'amber', color: 'bg-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-200' },
  { id: 'purple', color: 'bg-purple-600', bg: 'bg-purple-50', text: 'text-purple-600', shadow: 'shadow-purple-200' },
  { id: 'slate', color: 'bg-slate-800', bg: 'bg-slate-100', text: 'text-slate-800', shadow: 'shadow-slate-200' },
];

const ChatWindow: React.FC<ChatWindowProps> = ({ room, currentUser, onRoomUpdated, onRoomDeleted, onViewProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'POLLING' | 'REALTIME'>('REALTIME');
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [inviteeUsername, setInviteeUsername] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [renameError, setRenameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<{ userId: number; role: string; joinedAt: string; username: string }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageTimeRef = useRef<string | undefined>(undefined);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTheme = THEMES.find(t => t.id === (room.theme || 'indigo')) || THEMES[0];

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const msgs = await api.messages.list(room.id);
      setMessages(msgs);
      if (msgs.length > 0) {
          lastMessageTimeRef.current = msgs[msgs.length - 1].createdAt;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [room.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (mode !== 'POLLING') return;
    const interval = setInterval(async () => {
      try {
        const newMsgs = await api.messages.list(room.id, lastMessageTimeRef.current);
        if (newMsgs.length > 0) {
          setMessages(prev => [...prev, ...newMsgs]);
          lastMessageTimeRef.current = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [mode, room.id]);

  useEffect(() => {
    if (mode !== 'REALTIME') return;

    const unsubscribe = socket.subscribe(
      room.id,
      // Nouveau message
      (rawMsg: any) => {
        const normalizedMsg: Message = {
          ...rawMsg,
          id: Number(rawMsg.id),
          roomId: Number(rawMsg.roomId),
          authorUserId: Number(rawMsg.authorUserId),
          authorName: rawMsg.authorName ?? 'Utilisateur',
        };

        setMessages(prev => {
          if (prev.some(m => m.id === normalizedMsg.id)) return prev;
          return [...prev, normalizedMsg];
        });

        lastMessageTimeRef.current = normalizedMsg.createdAt;
      },
      // Message modifié
      (updatedMsg: any) => {
        const normalizedMsg: Message = {
          ...updatedMsg,
          id: Number(updatedMsg.id),
          roomId: Number(updatedMsg.roomId),
          authorUserId: Number(updatedMsg.authorUserId),
          authorName: updatedMsg.authorName ?? 'Utilisateur',
        };
        setMessages(prev => prev.map(m => m.id === normalizedMsg.id ? normalizedMsg : m));
      },
      // Message supprimé
      (data: { messageId: number }) => {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      }
    );

    return () => unsubscribe();
  }, [mode, room.id]);

  // Typing indicator: subscribe to typing events
  useEffect(() => {
    const unsubscribe = socket.subscribeTyping(
      room.id,
      (data) => {
        if (data.userId === currentUser.id) return;
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.set(data.userId, data.username);
          return next;
        });
        // Auto-clear after 3s if no stopTyping received
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Map(prev);
            next.delete(data.userId);
            return next;
          });
        }, 3000);
      },
      (data) => {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      }
    );

    return () => {
      unsubscribe();
      setTypingUsers(new Map());
    };
  }, [room.id, currentUser.id]);

  const handleInputChange = (value: string) => {
    setInput(value);

    if (value.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emitTyping(room.id, currentUser.id, currentUser.username);
      }
      // Reset the timeout on each keystroke
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socket.emitStopTyping(room.id, currentUser.id);
      }, 2000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emitStopTyping(room.id, currentUser.id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    const replyId = replyingTo?.id;
    setInput('');
    setReplyingTo(null);
    // Stop typing on send
    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emitStopTyping(room.id, currentUser.id);
    try {
      await api.messages.send(room.id, currentUser.id, currentUser.username, text, replyId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleThemeChange = async (themeId: RoomTheme) => {
    try {
      await api.rooms.updateTheme(room.id, themeId);
      onRoomUpdated();
      setShowThemePicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteeUsername('');
    setInviteError('');
    setInviteSuccess('');
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    try {
      await api.invitations.send(room.id, currentUser.id, inviteeUsername);
      setInviteSuccess(`Invitation envoyée !`);
      setInviteeUsername('');
      setTimeout(() => closeInviteModal(), 2000);
    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  const handleRenameRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenameError('');
    try {
      await api.rooms.rename(room.id, currentUser.id, newRoomName);
      setShowRenameModal(false);
      setNewRoomName('');
      onRoomUpdated();
    } catch (err: any) {
      setRenameError(err.message);
    }
  };

  const loadMembers = useCallback(async () => {
    try {
      const data = await api.rooms.getMembers(room.id);
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  }, [room.id]);

  useEffect(() => {
    if (showMembers) loadMembers();
  }, [showMembers, loadMembers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await api.messages.search(room.id, query.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDeleteRoom = async () => {
    try {
      await api.rooms.delete(room.id, currentUser.id);
      setShowDeleteConfirm(false);
      onRoomDeleted();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    await api.messages.delete(messageId, currentUser.id, room.id);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleEditMessage = async (messageId: number) => {
    const updated = await api.messages.update(
      messageId,
      currentUser.id,
      editingContent
    );

    setMessages(prev =>
      prev.map(m => (m.id === messageId ? updated : m))
    );

    setEditingMessageId(null);
    setEditingContent('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <header className="glass h-24 px-10 flex items-center justify-between z-30 sticky top-0 border-b border-slate-200 shadow-sm">
        <div className="flex items-center space-x-6">
           <div className={`w-14 h-14 ${activeTheme.bg} rounded-[1.5rem] flex items-center justify-center ${activeTheme.text} font-black shadow-xl border border-white/50 transform hover:scale-105 transition-all duration-300`}>
              {room.type === RoomType.GENERAL ? '#' : '🔒'}
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{room.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                  <span className={`relative flex h-2.5 w-2.5`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTheme.color}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeTheme.color}`}></span>
                  </span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discussion active</p>
              </div>
           </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Owner Actions: Rename & Delete */}
          {room.ownerUserId === currentUser.id && (
            <>
              <button
                onClick={() => { setNewRoomName(room.name); setShowRenameModal(true); }}
                className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-indigo-600 active:scale-95"
                title="Renommer le salon"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-rose-600 active:scale-95"
                title="Supprimer le salon"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}

          {/* Members Button */}
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-600 active:scale-95 ${showMembers ? 'ring-2 ring-indigo-200' : ''}`}
            title="Voir les membres"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-600 active:scale-95 ${showSearch ? 'ring-2 ring-indigo-200' : ''}`}
            title="Rechercher dans les messages"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={`p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:${activeTheme.text} active:scale-95`}
              title="Changer le thème"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
            {showThemePicker && (
              <div className="absolute right-0 mt-4 p-5 bg-white rounded-[2rem] shadow-2xl border border-slate-100 min-w-[220px] animate-slide-up z-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-1">Personnaliser l'espace</p>
                <div className="grid grid-cols-3 gap-4">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`w-12 h-12 rounded-[1rem] transition-all transform hover:scale-110 active:scale-90 shadow-md ${theme.color} ${room.theme === theme.id ? 'ring-4 ring-offset-2 ring-indigo-100' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {room.ownerUserId === currentUser.id && room.type === RoomType.PRIVATE && (
            <button
                onClick={() => setShowInviteModal(true)}
                className={`${activeTheme.color} hover:brightness-110 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl ${activeTheme.shadow} transition-all hover:scale-105 active:scale-95`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            </button>
          )}
        </div>
      </header>

      {/* Search Panel */}
      {showSearch && (
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm px-10 py-4 animate-in slide-in-from-top duration-200">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-5 py-3">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-400"
                placeholder="Rechercher dans les messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
              />
              {searchLoading && (
                <div className={`w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin`}></div>
              )}
              <button onClick={closeSearch} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {searchQuery.trim() && !searchLoading && (
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {searchResults.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 font-bold py-4">Aucun résultat</p>
                ) : (
                  searchResults.map(result => (
                    <div
                      key={result.id}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => {
                        closeSearch();
                        const el = document.getElementById(`msg-${result.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-2', 'ring-indigo-300');
                          setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-300'), 2000);
                        }
                      }}
                    >
                      <Avatar name={result.authorName || 'Utilisateur'} size="sm" className="shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{result.authorName || 'Utilisateur'}</span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(result.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-semibold truncate">{result.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 animate-slide-up py-20">
            <div className={`w-36 h-36 ${activeTheme.bg} rounded-[3rem] flex items-center justify-center mb-10 border border-white/50 shadow-inner`}>
                <svg className={`w-16 h-16 ${activeTheme.text} opacity-20`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">Ici commence votre histoire</p>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-[0.1em]">Envoyez le premier message !</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.authorUserId === currentUser.id;
          const showHeader = idx === 0 || messages[idx-1].authorUserId !== msg.authorUserId;

          return (
            <div key={msg.id} id={`msg-${msg.id}`} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-5 animate-in slide-in-from-bottom-5 duration-500 group transition-all`}>
              <div className={`w-11 shrink-0 ${!showHeader && 'opacity-0 h-0 pointer-events-none'}`}>
                  <button onClick={() => onViewProfile(msg.authorUserId)} className="relative hover:scale-110 transition-transform">
                    <Avatar
                      name={isMe ? currentUser.username : (msg.authorName || 'Utilisateur')}
                      size="md"
                      className="ring-4 ring-white shadow-xl border border-slate-100"/>
                    {!isMe && <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${activeTheme.color} border-2 border-white rounded-full`}></div>}
                  </button>
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] lg:max-w-[75%]`}>
                {/* NOM DE L'AUTEUR DANS LE CHAT */}
                {showHeader && (
                  <div className={`flex items-center space-x-2 mb-3 px-1 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <button
                      onClick={() => !isMe && onViewProfile(msg.authorUserId)}
                      className={`text-[12px] font-black uppercase tracking-widest transition-colors ${isMe ? activeTheme.text : 'text-slate-800 hover:' + activeTheme.text}`}
                    >
                      {isMe ? currentUser.username : (msg.authorName || 'Utilisateur')}
                    </button>
                    <span className="text-[10px] text-slate-300 font-bold">•</span>
                    <p className="text-[10px] font-bold text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                <div  className={`relative px-5 py-3.5 rounded-[1.5rem] transition-all ${
                  isMe
                    ? `${activeTheme.color} text-white rounded-tr-none`
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/40'
                }`}>
                  {/* Reply quote block */}
                  {msg.replyToId && (
                    <div className={`mb-2 px-3 py-2 rounded-xl text-xs border-l-4 ${
                      isMe
                        ? 'bg-white/15 border-white/40'
                        : 'bg-slate-100 border-slate-300'
                    }`}>
                      <p className={`font-black text-[10px] uppercase tracking-widest mb-0.5 ${isMe ? 'text-white/70' : 'text-slate-500'}`}>
                        {msg.replyToAuthorName || 'Utilisateur'}
                      </p>
                      <p className={`font-semibold truncate ${isMe ? 'text-white/80' : 'text-slate-600'}`}>
                        {msg.replyToContent || 'Message supprimé'}
                      </p>
                    </div>
                  )}
                  {editingMessageId === msg.id ? (
                    <div className={`flex flex-col gap-3 min-w-[200px] p-2 rounded-lg backdrop-blur-[2px] ${
                        isMe
                          ? `${activeTheme.color}/70 text-white`
                          : 'bg-slate-100/80 text-slate-800'
                      }`}>
                      <textarea
                        value={editingContent}
                        onChange={e => {
                          setEditingContent(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleEditMessage(msg.id);
                          }
                          if (e.key === 'Escape') {
                            setEditingMessageId(null);
                            setEditingContent('');
                          }
                        }}
                        ref={el => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }
                        }}
                        autoFocus
                        className={`w-full bg-transparent border-none outline-none resize-none text-[16px] leading-relaxed font-semibold p-2 ${
                          isMe ? 'text-white placeholder-white/60' : 'text-slate-800 placeholder-slate-500'
                        }`}
                        style={{ minHeight: '60px', maxHeight: '200px', overflowY: 'auto' }}
                      />
                      <div className={`flex items-center gap-2 text-[10px] font-bold ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                        <button
                          onClick={() => handleEditMessage(msg.id)}
                          className={`px-3 py-1.5 rounded-lg transition-all ${
                            isMe
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditingContent('');
                          }}
                          className="hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[16px] leading-relaxed font-semibold whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                  {editingMessageId !== msg.id && (
                    <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="px-3 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200 transition"
                      >
                        Répondre
                      </button>
                      {isMe && (
                        <>
                          <button
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditingContent(msg.content);
                            }}
                            className="px-3 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200 transition"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="px-3 py-1 rounded-md text-xs font-semibold text-rose-600 bg-rose-100/80 hover:bg-rose-200 transition"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-10 pb-1 pt-2">
          <div className="max-w-5xl mx-auto flex items-center gap-2 px-4">
            <div className="flex gap-1">
              <span className={`w-2 h-2 rounded-full ${activeTheme.color} animate-bounce`} style={{ animationDelay: '0ms' }}></span>
              <span className={`w-2 h-2 rounded-full ${activeTheme.color} animate-bounce`} style={{ animationDelay: '150ms' }}></span>
              <span className={`w-2 h-2 rounded-full ${activeTheme.color} animate-bounce`} style={{ animationDelay: '300ms' }}></span>
            </div>
            <p className="text-xs font-bold text-slate-400">
              {[...typingUsers.values()].join(', ')} {typingUsers.size === 1 ? 'est en train d\'écrire...' : 'sont en train d\'écrire...'}
            </p>
          </div>
        </div>
      )}

      {/* Footer / Input */}
      <footer className="p-10 pt-4 bg-transparent z-20">
        {/* Reply preview bar */}
        {replyingTo && (
          <div className="max-w-5xl mx-auto mb-3 flex items-center gap-3 px-8 py-3 bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2 duration-200">
            <div className={`w-1 h-10 rounded-full ${activeTheme.color}`}></div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text}`}>
                {replyingTo.authorName || 'Utilisateur'}
              </p>
              <p className="text-sm text-slate-500 font-semibold truncate">
                {replyingTo.content.length > 80 ? replyingTo.content.slice(0, 80) + '...' : replyingTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex space-x-5 items-center glass p-5 rounded-[3rem] border border-slate-200/50 shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all focus-within:shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
          <div className="flex-1 flex items-center bg-slate-100/50 rounded-[2rem] px-8 py-1 focus-within:bg-white transition-all ring-1 ring-transparent focus-within:ring-slate-100">
            <input
              type="text"
              className="w-full py-5 bg-transparent text-[16px] font-black text-slate-800 placeholder-slate-400 outline-none"
              placeholder={`Partager quelque chose dans ${room.name}...`}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={`${activeTheme.color} text-white w-16 h-16 rounded-[2rem] flex items-center justify-center hover:brightness-110 transition-all shadow-2xl ${activeTheme.shadow} disabled:opacity-30 disabled:shadow-none transform active:scale-90`}
            disabled={!input.trim()}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </footer>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-sm w-full p-14 animate-slide-up border border-white/20">
            <div className="text-center mb-12">
              <div className={`w-24 h-24 ${activeTheme.bg} rounded-[2.5rem] flex items-center justify-center ${activeTheme.text} mx-auto mb-8 shadow-inner`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Renommer le salon</h3>
              <p className="text-sm text-slate-400 mt-3 font-bold uppercase tracking-widest">Choisir un nouveau nom</p>
            </div>
            <form onSubmit={handleRenameRoom} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nouveau nom</label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={100}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-7 py-5 outline-none focus:ring-4 focus:ring-slate-100 transition-all font-black text-slate-800"
                  placeholder="ex: Mon super salon"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              </div>
              {renameError && <p className="text-rose-500 text-xs font-black text-center px-4 animate-bounce">{renameError}</p>}
              <div className="flex flex-col space-y-5">
                <button
                  type="submit"
                  className={`w-full py-6 ${activeTheme.color} text-white rounded-[1.5rem] font-black shadow-2xl ${activeTheme.shadow} hover:brightness-110 transition-all hover:scale-[1.02] active:scale-95`}
                >
                  Renommer
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRenameModal(false); setNewRoomName(''); setRenameError(''); }}
                  className="w-full py-4 text-slate-400 hover:text-slate-800 font-black text-[11px] uppercase tracking-widest transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-sm w-full p-14 animate-slide-up border border-white/20">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-600 mx-auto mb-8 shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Supprimer le salon</h3>
              <p className="text-sm text-slate-400 mt-3 font-bold uppercase tracking-widest">Cette action est irreversible</p>
            </div>
            <p className="text-center text-slate-600 font-semibold mb-10">
              Tous les messages, membres et invitations de <span className="font-black">{room.name}</span> seront supprimés.
            </p>
            <div className="flex flex-col space-y-5">
              <button
                onClick={handleDeleteRoom}
                className="w-full py-6 bg-rose-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-rose-200 hover:brightness-110 transition-all hover:scale-[1.02] active:scale-95"
              >
                Confirmer la suppression
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 text-slate-400 hover:text-slate-800 font-black text-[11px] uppercase tracking-widest transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Side Panel */}
      {showMembers && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Membres</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{members.length} membre{members.length > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setShowMembers(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {members.map(member => (
              <button
                key={member.userId}
                onClick={() => { onViewProfile(member.userId); setShowMembers(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all text-left"
              >
                <Avatar name={member.username} size="md" className="ring-2 ring-white shadow-md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 truncate">{member.username}</span>
                    {member.role === 'OWNER' && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${activeTheme.bg} ${activeTheme.text}`}>
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Membre depuis {new Date(member.joinedAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-sm w-full p-14 animate-slide-up border border-white/20">
            <div className="text-center mb-12">
                <div className={`w-24 h-24 ${activeTheme.bg} rounded-[2.5rem] flex items-center justify-center ${activeTheme.text} mx-auto mb-8 shadow-inner animate-float`}>
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Inviter un Ami</h3>
                <p className="text-sm text-slate-400 mt-3 font-bold uppercase tracking-widest">Agrandir le cercle</p>
            </div>

            <form onSubmit={handleInvite} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Username de l'invité</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-7 py-5 outline-none focus:ring-4 focus:ring-slate-100 transition-all font-black text-slate-800"
                  placeholder="ex: marc_antoine"
                  value={inviteeUsername}
                  onChange={(e) => setInviteeUsername(e.target.value)}
                />
              </div>

              {inviteError && <p className="text-rose-500 text-xs font-black text-center px-4 animate-bounce">{inviteError}</p>}
              {inviteSuccess && <p className="text-emerald-500 text-xs font-black text-center px-4">{inviteSuccess}</p>}

              <div className="flex flex-col space-y-5">
                <button
                  type="submit"
                  className={`w-full py-6 ${activeTheme.color} text-white rounded-[1.5rem] font-black shadow-2xl ${activeTheme.shadow} hover:brightness-110 transition-all hover:scale-[1.02] active:scale-95`}
                >
                  Envoyer l'invitation
                </button>
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="w-full py-4 text-slate-400 hover:text-slate-800 font-black text-[11px] uppercase tracking-widest transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
