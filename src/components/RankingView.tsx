import { Crown, TrendingUp } from "lucide-react";
import { Poll } from "../types";
import { motion } from "motion/react";
import { Skeleton, RankingSkeleton } from "./Skeleton";

interface RankingViewProps {
  polls: Poll[];
  loading?: boolean;
}

export default function RankingView({ polls, loading }: RankingViewProps) {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex flex-col md:row items-center justify-between mb-12 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
        </div>
        <RankingSkeleton />
      </div>
    );
  }

  // Aggregate all contestants from all active polls
  const allContestants = polls
    .flatMap(poll => poll.options.map(opt => ({ ...opt, pollCategory: poll.category })))
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="flex flex-col md:row items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-display gold-text tracking-tighter mb-2">RANKING DOS FAVORITOS</h2>
          <p className="text-zinc-400">Os participantes mais votados em todas as enquetes ativas.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
          <button className="px-6 py-2 bg-neon-green text-black font-bold rounded-xl text-sm">Geral</button>
          <button className="px-6 py-2 text-zinc-400 font-bold rounded-xl text-sm hover:text-white">BBB</button>
          <button className="px-6 py-2 text-zinc-400 font-bold rounded-xl text-sm hover:text-white">Fazenda</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {allContestants.map((contestant, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={`${contestant.id}-${idx}`}
            className={`relative glass p-6 rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all ${
              idx === 0 ? "border-amber-400/30 bg-amber-400/5" : "border-white/5"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden glass">
                  {contestant.imageUrl ? (
                    <img src={contestant.imageUrl} className="w-full h-full object-cover" alt={contestant.label} referrerPolicy="no-referrer" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                </div>
                {idx < 3 && (
                  <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                    idx === 0 ? "bg-amber-400 text-black" : 
                    idx === 1 ? "bg-zinc-300 text-black" : 
                    "bg-amber-700 text-white"
                  }`}>
                    {idx === 0 ? <Crown className="w-4 h-4" /> : <span className="font-bold">{idx + 1}</span>}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold group-hover:text-neon-green transition-colors">{contestant.label}</h3>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{contestant.pollCategory}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1 text-neon-green">
                <TrendingUp className="w-4 h-4" />
                <span className="text-2xl font-display leading-none">{contestant.votes.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">votos recebidos</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
