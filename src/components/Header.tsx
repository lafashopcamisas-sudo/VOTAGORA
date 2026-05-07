import { Home, Trophy, History, Menu, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ currentTab, onTabChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Início", icon: <Home className="w-5 h-5" /> },
    { id: "news", label: "Notícias", icon: <Menu className="w-5 h-5" /> },
    { id: "ranking", label: "Ranking", icon: <Trophy className="w-5 h-5" /> },
    { id: "closed", label: "Encerradas", icon: <History className="w-5 h-5" /> },
  ];

  return (
    <header className="fixed top-9 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onTabChange("home")}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-reality-red rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-300 shadow-[0_0_20px_rgba(227,6,19,0.5)]">
              <span className="text-white font-display text-2xl leading-none">V</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <CheckCircle2 className="w-2.5 h-2.5 text-reality-red fill-current" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-3xl font-display tracking-tighter leading-none text-white">VOTA<span className="text-reality-red">GORA</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold leading-none mt-1">Portal de Enquetes</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-6 py-2 rounded-full flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-all ${
                currentTab === item.id 
                ? "bg-reality-red text-white shadow-[0_0_20px_rgba(227,6,19,0.4)]" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-zinc-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-zinc-950 border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-4 rounded-xl flex items-center gap-4 text-left ${
                    currentTab === item.id 
                    ? "bg-neon-green/10 text-neon-green" 
                    : "text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
