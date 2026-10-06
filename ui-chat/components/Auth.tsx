import React, { useState } from 'react';
import { api } from '../services/api';
import { AuthSession } from '../types';

interface AuthProps {
  onLogin: (session: AuthSession) => void;
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const MIN_PASSWORD_LEN = 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && password.length < MIN_PASSWORD_LEN) {
      setError(`Le mot de passe est trop court : minimum ${MIN_PASSWORD_LEN} caractères requis.`);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await api.auth.register(username, email, password);
        const session = await api.auth.login(email, password);
        onLogin(session);
      } else {
        const session = await api.auth.login(email, password);
        onLogin(session);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#404eed] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Background Shapes identical to Landing Page */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-white/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-black/20 blur-[130px] rounded-full animate-bounce duration-[20s] pointer-events-none"></div>

      {/* Header - Logo at the top */}
      <nav className="max-w-7xl mx-auto w-full px-8 py-6 flex items-center justify-between z-30">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={onBack}>
            <div className="w-10 h-10 bg-white text-[#404eed] rounded-xl flex items-center justify-center font-black shadow-xl transform group-hover:rotate-12 transition-transform duration-300">CP</div>
            <span className="text-2xl font-black tracking-tighter">ChatPro</span>
        </div>

        {onBack && (
          <button
              onClick={onBack}
              className="text-white/70 hover:text-white flex items-center space-x-2 font-black uppercase tracking-widest text-xs transition-all group"
          >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Accueil</span>
          </button>
        )}
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 z-10 relative pb-20">
        <div className="max-w-md w-full glass bg-white/10 p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-white/20 animate-slide-up backdrop-blur-2xl text-center">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-md mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Espace 100% liberté & Chill</p>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
              {isRegister ? 'Rejoindre ChatPro' : 'Bon retour !'}
            </h2>
            <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px]">
              {isRegister ? 'Partage en toute liberté' : 'Tes amis t\'attendent'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-200 text-[11px] font-black rounded-2xl text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {isRegister && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="nom_utilisateur"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:ring-4 focus:ring-white/10 outline-none transition-all font-bold"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:ring-4 focus:ring-white/10 outline-none transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Mot de passe</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:ring-4 focus:ring-white/10 outline-none transition-all font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isRegister && password.length > 0 && password.length < MIN_PASSWORD_LEN && (
                <div className="flex items-center space-x-2 mt-2 ml-1 text-rose-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Minimum {MIN_PASSWORD_LEN} caractères ({password.length}/{MIN_PASSWORD_LEN})
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-5 bg-white text-[#404eed] rounded-2xl shadow-2xl text-sm font-black transition-all transform active:scale-95 disabled:opacity-50 mt-4 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-[#404eed]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isRegister ? "CRÉER MON COMPTE" : 'SE CONNECTER'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-white/40 hover:text-white transition-colors font-black uppercase tracking-widest"
            >
              {isRegister ? 'Déjà un compte ? Connexion' : 'Pas encore de compte ? Inscription'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer wave responsive */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="block w-full h-[clamp(120px,22vh,260px)]"
        >
            <path
            fill="#23272a"
            fillOpacity="1"
            d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,144C672,149,768,203,864,218.7C960,235,1056,213,1152,181.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
        </svg>
      </div>
    </div>
  );
};

export default Auth;
