import { ChevronLeft, Share2, CheckCircle2, TrendingUp, MessageCircle, Twitter, Facebook, Link, Copy, Check } from "lucide-react";
import { Poll } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import CommentsSection from "./CommentsSection";

interface PollDetailProps {
  poll: Poll;
  onBack: () => void;
  onVote: (pollId: string, optionId: string) => void;
  hasVoted: boolean;
  votedOptionId?: string;
}

export default function PollDetail({ poll, onBack, onVote, hasVoted, votedOptionId }: PollDetailProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const OPTIONS_THRESHOLD = 6;
  const hasManyOptions = poll.options.length > OPTIONS_THRESHOLD;
  const visibleOptions = showAllOptions ? poll.options : poll.options.slice(0, OPTIONS_THRESHOLD);

  // Auto-scroll to top when poll changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [poll.id]);

  const handleVoteClick = () => {
    if (selectedOption && !hasVoted) {
      setIsAnimating(true);
      setTimeout(() => {
        onVote(poll.id, selectedOption);
        setIsAnimating(false);
      }, 600);
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return ((votes / poll.totalVotes) * 100).toFixed(1);
  };

  const shareUrl = `${window.location.origin}/?poll=${poll.id}`;
  const shareText = `Votação ativa: ${poll.question} - Participe agora no VOTAGORA! 🔥`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialActions = [
    { 
      name: "WhatsApp", 
      icon: <MessageCircle className="w-5 h-5" />, 
      color: "bg-[#25D366]", 
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}` 
    },
    { 
      name: "Twitter", 
      icon: <Twitter className="w-5 h-5" />, 
      color: "bg-[#1DA1F2]", 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` 
    },
    { 
      name: "Facebook", 
      icon: <Facebook className="w-5 h-5" />, 
      color: "bg-[#1877F2]", 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 mt-20">
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group uppercase text-[10px] font-black tracking-widest"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao início
        </button>
        
        <button 
          onClick={() => setShowShareOptions(!showShareOptions)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-[10px] font-black uppercase tracking-widest ${
            showShareOptions 
            ? "bg-reality-red border-reality-red text-white" 
            : "glass border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
          }`}
        >
          <Share2 className="w-4 h-4" />
          {showShareOptions ? "Fechar" : "Compartilhar"}
        </button>
      </div>

      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-6 rounded-[2rem] border-white/10 mb-8 flex flex-wrap items-center justify-center gap-4 relative z-50 shadow-2xl"
          >
            <div className="w-full text-center mb-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Compartilhe esta enquete</p>
            </div>
            {socialActions.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.color} text-white p-4 rounded-2xl hover:scale-110 transition-all shadow-lg flex items-center justify-center`}
                title={`Compartilhar no ${social.name}`}
              >
                {social.icon}
              </a>
            ))}
            <button
              onClick={copyToClipboard}
              className="bg-white text-black p-4 rounded-2xl hover:scale-110 transition-all shadow-lg flex items-center justify-center relative"
              title="Copiar Link"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              <AnimatePresence>
                {copied && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase text-green-500"
                  >
                    Copiado!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Image & Question */}
        <div className="lg:col-span-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-[3rem] overflow-hidden shadow-2xl border-white/5"
          >
            <div className="relative h-72 sm:h-[450px] w-full">
              <img 
                src={poll.imageUrl} 
                className="w-full h-full object-cover" 
                alt="Banner" 
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent p-10 flex flex-col justify-end">
                <div className="flex gap-3 mb-6">
                  <span className="px-5 py-1.5 bg-reality-red text-white font-black text-[10px] rounded-lg uppercase tracking-widest shadow-lg">
                    {poll.category}
                  </span>
                  <span className="px-5 py-1.5 bg-white/10 backdrop-blur-md text-white font-black text-[10px] rounded-lg flex items-center gap-2 uppercase tracking-widest border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                    Ao Vivo
                  </span>
                </div>
                <h2 className="text-4xl sm:text-6xl font-display text-white max-w-3xl leading-[0.9] tracking-tighter mb-4">
                  {poll.question}
                </h2>
                <div className="flex items-center gap-6 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-reality-red" />
                    <span>{poll.totalVotes.toLocaleString()} votos</span>
                  </div>
                  <span>Atualizado agora</span>
                </div>
              </div>
            </div>

            <div className="p-10 bg-[#0A0A0A]">
              {!hasVoted ? (
                <div className="space-y-6">
                  <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-zinc-800"></span>
                    Selecione uma opção para votar
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {visibleOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`relative group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                          selectedOption === option.id 
                          ? "bg-reality-red/10 border-reality-red shadow-[0_0_30px_rgba(227,6,19,0.2)]" 
                          : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                        }`}
                      >
                        {option.imageUrl && (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative">
                            <img src={option.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={option.label} referrerPolicy="no-referrer" loading="lazy" />
                            <div className="absolute inset-0 bg-black/20"></div>
                          </div>
                        )}
                        <span className={`text-xl font-display uppercase tracking-tight ${selectedOption === option.id ? "text-white" : "text-zinc-400"}`}>
                          {option.label}
                        </span>
                        
                        {selectedOption === option.id && (
                          <motion.div 
                            layoutId="check"
                            className="ml-auto w-10 h-10 rounded-full bg-reality-red text-white flex items-center justify-center shadow-lg"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>

                  {hasManyOptions && (
                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={() => setShowAllOptions(!showAllOptions)}
                        className="flex items-center gap-2 px-6 py-3 glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                      >
                        {showAllOptions ? "Ver menos" : `Ver mais ${poll.options.length - OPTIONS_THRESHOLD} opções`}
                      </button>
                    </div>
                  )}

                  <div className="pt-6">
                    <button
                      onClick={handleVoteClick}
                      disabled={!selectedOption || isAnimating}
                      className={`w-full py-6 rounded-3xl font-display text-3xl tracking-widest uppercase transition-all shadow-2xl relative overflow-hidden ${
                        selectedOption && !isAnimating
                        ? "bg-reality-red text-white hover:scale-[1.02] active:scale-[0.98] shadow-reality-red/30"
                        : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {isAnimating ? (
                          <motion.span 
                            key="voted"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center justify-center gap-4"
                          >
                            <TrendingUp className="animate-bounce" /> COMPUTANDO...
                          </motion.span>
                        ) : (
                          <motion.span key="vote">VOTAR AGORA</motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col md:row items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-3xl font-display gold-text uppercase">Resultado Parcial</h3>
                      <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Dados atualizados em tempo real conforme as votações.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-reality-red/10 px-6 py-3 rounded-2xl border border-reality-red/20 shadow-xl">
                      <TrendingUp className="w-5 h-5 text-reality-red" />
                      <span className="text-xl font-display text-white">{poll.totalVotes.toLocaleString()} Votos</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {poll.options
                      .sort((a, b) => b.votes - a.votes)
                      .slice(0, showAllOptions ? poll.options.length : OPTIONS_THRESHOLD)
                      .map((option, idx) => {
                        const isUserVote = option.id === votedOptionId;
                        return (
                          <div 
                            key={option.id} 
                            className={`relative glass p-6 rounded-3xl overflow-hidden border transition-all duration-500 group ${
                              isUserVote ? "border-reality-red shadow-[0_0_30px_rgba(227,6,19,0.2)] bg-reality-red/5" : "border-white/5"
                            }`}
                          >
                            {/* Progress Bar Background */}
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${getPercentage(option.votes)}%` }}
                              transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }}
                              className={`absolute inset-0 bg-reality-red shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] ${isUserVote ? "opacity-30" : "opacity-20"}`}
                            />
                            
                            <div className="relative flex items-center justify-between z-10">
                              <div className="flex items-center gap-6">
                                <div className="relative">
                                  <div className={`w-16 h-16 rounded-2xl overflow-hidden glass border group-hover:scale-105 transition-transform ${isUserVote ? "border-reality-red shadow-lg" : "border-white/10"}`}>
                                    <img src={option.imageUrl} className={`w-full h-full object-cover transition-all ${isUserVote ? "grayscale-0" : "grayscale group-hover:grayscale-0"}`} alt={option.label} referrerPolicy="no-referrer" loading="lazy" />
                                  </div>
                                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-display text-lg shadow-xl text-white">
                                    {idx + 1}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-display uppercase tracking-tight text-white block">{option.label}</span>
                                    {isUserVote && (
                                      <span className="px-2 py-0.5 bg-reality-red text-white text-[8px] font-black uppercase rounded tracking-widest shadow-lg animate-pulse">
                                        Seu Voto
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                    {option.votes.toLocaleString()} votos
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-display text-white leading-none tracking-tighter">
                                  {getPercentage(option.votes)}<span className="text-reality-red text-2xl">%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {hasManyOptions && (
                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={() => setShowAllOptions(!showAllOptions)}
                        className="flex items-center gap-2 px-6 py-3 glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                      >
                        {showAllOptions ? "Ver menos resultados" : `Ver todos os ${poll.options.length} resultados`}
                      </button>
                    </div>
                  )}

                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col md:row items-center justify-between gap-8 mt-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-reality-red/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex items-center gap-6 text-zinc-300 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-reality-red flex items-center justify-center shadow-[0_0_30px_rgba(227,6,19,0.5)]">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-3xl uppercase leading-none tracking-tight">Obrigado por votar!</p>
                        <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-1">Sua voz faz a diferença no reality.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowShareOptions(true)}
                      className="flex items-center gap-3 px-10 py-5 bg-white text-black font-display text-2xl uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl relative z-10"
                    >
                      <Share2 className="w-6 h-6" /> {showShareOptions ? "Opções Abertas" : "Compartilhar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-12">
        <CommentsSection pollId={poll.id} />
      </div>
    </div>
  );
}
