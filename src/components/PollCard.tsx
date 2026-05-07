import { Users, Clock, Share2, Twitter, Facebook, MessageCircle } from "lucide-react";
import { Poll } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface PollCardProps {
  poll: Poll;
  onClick: (id: string) => void;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  hasVoted: boolean;
  onShareWhatsApp: (poll: Poll) => void;
  onShareTwitter: (poll: Poll) => void;
  onShareFacebook: (poll: Poll) => void;
}

export default function PollCard({ 
  poll, 
  onClick, 
  onVote, 
  hasVoted, 
  onShareWhatsApp, 
  onShareTwitter, 
  onShareFacebook 
}: PollCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isQuickVoting, setIsQuickVoting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const winner = poll.options.length > 0 
    ? [...poll.options].sort((a, b) => b.votes - a.votes)[0]
    : null;

  const handleQuickVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVoted || isQuickVoting || !winner) return;

    setIsQuickVoting(true);
    try {
      await onVote(poll.id, winner.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao votar rápido:", error);
    } finally {
      setIsQuickVoting(false);
    }
  };

  const isNew = new Date().getTime() - new Date(poll.createdAt).getTime() < 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group relative h-full flex flex-col glass rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/5 hover:border-reality-red/30 transition-all duration-500"
      onClick={() => onClick(poll.id)}
    >
      {/* Category Badge & New Badge */}
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
          poll.category === "BBB" ? "bg-cyan-500 text-white" : 
          poll.category === "A Fazenda" ? "bg-amber-600 text-white" : 
          "bg-reality-red text-white"
        }`}>
          {poll.category}
        </span>
        {isNew && (
          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg bg-white text-reality-red border border-reality-red animate-pulse">
            NOVA
          </span>
        )}
      </div>

      {/* Image Header */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img 
          animate={showSuccess ? { 
            scale: [1, 1.1, 1],
            rotate: [0, -1, 1, -1, 0]
          } : {}}
          transition={{ duration: 0.5 }}
          src={poll.imageUrl} 
          alt={poll.question} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        
        {/* Live indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2 text-white font-bold text-[10px] bg-reality-red px-3 py-1.5 rounded-lg border border-white/20 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          Ao Vivo
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow bg-[#0A0A0A]">
        <h3 className="text-2xl font-display leading-[1.1] mb-6 text-white group-hover:text-reality-red transition-colors min-h-[3rem] uppercase tracking-tight">
          {poll.question}
        </h3>

        {/* Mini Results Preview */}
        {winner && (
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <span>Favorito</span>
              <span className="text-reality-red">{winner.label}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-reality-red shadow-[0_0_10px_rgba(227,6,19,0.5)]" 
                style={{ width: `${poll.totalVotes > 0 ? (winner.votes / poll.totalVotes) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* CTA Buttons & Share */}
        <div className="flex gap-3 mb-6 relative">
          <button 
            onClick={handleQuickVote}
            disabled={hasVoted || isQuickVoting}
            className={`flex-grow py-4 rounded-2xl font-display text-lg uppercase tracking-widest transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
              hasVoted 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-reality-red text-white hover:scale-105 active:scale-95 shadow-lg shadow-reality-red/20"
            }`}
          >
            {isQuickVoting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : showSuccess ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>VOTADO! ✨</motion.span>
            ) : hasVoted ? (
              "VOTADO"
            ) : (
              "VOTAR"
            )}
            
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 bg-green-500 flex items-center justify-center text-white"
                >
                  SUCESSO!
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick(poll.id);
            }}
            className="flex-grow py-4 glass text-white font-display text-lg uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all border-white/10"
          >
            VER ENQUETE
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className={`px-4 py-4 glass text-white hover:bg-white/10 border-white/10 rounded-2xl transition-all flex items-center justify-center shadow-lg ${showShareMenu ? "bg-white/10" : ""}`}
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-4 glass rounded-2xl border border-white/10 p-2 flex flex-col gap-1 z-50 shadow-2xl min-w-[150px]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareWhatsApp(poll);
                      setShowShareMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#25D366]/20 text-white rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest text-left"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    WhatsApp
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareTwitter(poll);
                      setShowShareMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1DA1F2]/20 text-white rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest text-left"
                  >
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    Twitter
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareFacebook(poll);
                      setShowShareMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1877F2]/20 text-white rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest text-left"
                  >
                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                    Facebook
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-zinc-600 text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-reality-red" />
            <span className="text-zinc-300">{poll.totalVotes?.toLocaleString() || 0}</span>
            <span>Votos</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Clock className="w-3.5 h-3.5" />
            <span>24h</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
