import { ExternalLink } from "lucide-react";
import { Ad } from "../types";
import { motion } from "motion/react";

interface AdSectionProps {
  ads: Ad[];
  loading?: boolean;
}

export default function AdSection({ ads, loading }: AdSectionProps) {
  // If no ads are provided, show placeholders (the "espacos" the user asked for)
  const displayAds = ads.length > 0 ? ads.slice(0, 3) : Array(3).fill(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-[2rem] h-64 border border-white/5 animate-pulse overflow-hidden">
             <div className="h-full w-full bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-[2px] bg-reality-red"></div>
        <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest">Patrocinados</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayAds.map((ad, index) => (
          <motion.a
            key={ad?.id || index}
            href={ad?.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-reality-red/30 transition-all aspect-[4/5] flex flex-col"
          >
            {ad ? (
              <>
                <div className="absolute inset-0 z-0">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                
                <div className="relative z-10 mt-auto p-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-reality-red text-[8px] font-black uppercase tracking-widest text-white mb-4">Destaque</span>
                  <h4 className="text-white font-display text-2xl uppercase tracking-tight mb-2 group-hover:text-reality-red transition-colors">{ad.title}</h4>
                  {ad.description && <p className="text-zinc-400 text-sm line-clamp-2 mb-6">{ad.description}</p>}
                  
                  <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                    Ver Produto <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-white/[0.02] border-2 border-dashed border-white/5 group-hover:border-reality-red/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-reality-red" />
                </div>
                <h4 className="text-zinc-500 font-display text-lg uppercase tracking-tight mb-2">Espaço Disponível</h4>
                <p className="text-zinc-600 text-xs italic">Seu produto aqui</p>
                <div className="mt-6 px-6 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:border-reality-red group-hover:text-reality-red transition-all">
                  Anuncie
                </div>
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </section>
  );
}
