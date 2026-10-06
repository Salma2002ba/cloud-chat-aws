import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#404eed] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Background Shapes Discord Style with softer glow */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-white/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-black/20 blur-[130px] rounded-full animate-bounce duration-[20s] pointer-events-none"></div>

      {/* Header */}
      <nav className="max-w-7xl mx-auto w-full px-8 py-6 flex items-center justify-between z-30">
        <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-white text-[#404eed] rounded-xl flex items-center justify-center font-black shadow-xl transform group-hover:rotate-12 transition-transform duration-300">CP</div>
            <span className="text-2xl font-black tracking-tighter">ChatPro</span>
        </div>

        <div className="hidden lg:flex items-center space-x-12 text-sm font-black uppercase tracking-widest text-white/70">
            <a href="#" className="hover:text-white transition-all">Découvrir</a>
            <a href="#" className="hover:text-white transition-all">L'Esprit Chill</a>
            <a href="#" className="hover:text-white transition-all">Sécurité</a>
            <a href="#" className="hover:text-white transition-all">Blog</a>
        </div>

        <div className="flex items-center space-x-4">
            <button
                onClick={onStart}
                className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-sm font-black transition-all border border-white/10"
            >
                Déjà membre ?
            </button>
            <button
                onClick={onStart}
                className="bg-white text-[#404eed] px-8 py-2.5 rounded-full text-sm font-black hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
                Log In
            </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 z-10 py-20 relative">
        {/* Floating Icons Chill Style */}
        <div className="absolute top-[20%] left-[10%] opacity-30 transform -rotate-12 animate-float pointer-events-none hidden xl:block">
            <div className="w-24 h-24 bg-amber-100 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/40">☕</div>
        </div>
        <div className="absolute bottom-[25%] right-[12%] opacity-30 transform rotate-12 animate-float pointer-events-none hidden xl:block" style={{animationDelay: '1.5s'}}>
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-5xl shadow-2xl shadow-indigo-500/40">✨</div>
        </div>
        <div className="absolute top-[35%] right-[10%] opacity-20 transform -rotate-6 animate-float pointer-events-none hidden lg:block" style={{animationDelay: '2.5s'}}>
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl shadow-xl border border-white/20">💬</div>
        </div>

        <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-md mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Espace 100% liberté & Chill</p>
            </div>

            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85]">
                VOTRE SALON,<br/>
                <span className="text-white/60">VOS AMIS,</span><br/>
                VOS DÉLIRES.
            </h1>

            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed text-white/80 tracking-tight">
                Oubliez les serveurs complexes et le bruit inutile. ChatPro est l'endroit parfait pour se poser, discuter en toute liberté et partager vos meilleurs moments avec ceux qui comptent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-5 sm:space-y-0 sm:space-x-8 pt-10">
                <button
                    onClick={onStart}
                    className="bg-white text-[#404eed] px-12 py-6 rounded-[2rem] text-xl font-black hover:shadow-[0_20px_50px_rgba(255,255,255,0.25)] transition-all transform hover:scale-105 active:scale-95 flex items-center group"
                >
                    <span>Lancer la discussion</span>
                    <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
                <button
                    className="bg-[#23272a] text-white px-12 py-6 rounded-[2rem] text-xl font-black hover:bg-[#2c2f33] transition-all transform hover:scale-105 active:scale-95 border border-white/5"
                >
                    Découvrir l'univers
                </button>
            </div>
        </div>
      </main>

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

export default LandingPage;
