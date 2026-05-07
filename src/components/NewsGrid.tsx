import { Clock, Tag } from "lucide-react";
import { News } from "../types";
import { motion } from "motion/react";

interface NewsGridProps {
  news: News[];
  loading?: boolean;
}

export default function NewsGrid({ news, loading }: NewsGridProps) {
  // Ensure exactly 6 slots as requested
  const displayNews = news.length > 0 ? news.slice(0, 6) : Array(6).fill(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass rounded-[2.5rem] border border-white/5 h-80 animate-pulse overflow-hidden">
            <div className="h-48 bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="h-4 w-1/4 bg-white/5 rounded-full" />
              <div className="h-6 w-3/4 bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayNews.map((item, index) => (
        <motion.article
          key={item?.id || index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className="group glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-reality-red/30 transition-all flex flex-col"
        >
          {item ? (
            <>
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {item.category && (
                  <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-reality-red/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </div>
                )}
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-4">
                  <Clock className="w-3 h-3 text-reality-red" />
                  {new Date(item.createdAt?.seconds * 1000 || item.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                <h3 className="text-white font-display text-xl leading-tight uppercase tracking-tight mb-4 group-hover:text-reality-red transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed mb-6">
                  {item.content}
                </p>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group/btn">
                    Ler Acontecimento
                    <div className="w-4 h-[1px] bg-reality-red group-hover/btn:w-8 transition-all"></div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center bg-white/[0.02] border-2 border-dashed border-white/5 opacity-50">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-zinc-700" />
              </div>
              <h4 className="text-zinc-600 font-display text-lg uppercase tracking-tight mb-2">Próxima Atualização</h4>
              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Aguardando Postagem</p>
            </div>
          )}
        </motion.article>
      ))}
    </div>
  );
}
