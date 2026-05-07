import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neon-green rounded-lg flex items-center justify-center rotate-3">
                <span className="text-black font-display text-xl">RV</span>
              </div>
              <h2 className="text-2xl font-display gold-text tracking-tight">RealityVote</h2>
            </div>
            <p className="text-zinc-400 max-w-sm mb-8">
              A maior plataforma independente de enquetes de entretenimento do Brasil. 
              Sua voz decide quem fica e quem sai nos maiores reality shows do país.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-zinc-400 hover:text-neon-green hover:border-neon-green/40 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-neon-green rounded-full"></span>
              Categorias
            </h3>
            <ul className="space-y-4 text-zinc-400">
              <li><a href="#" className="hover:text-neon-green transition-colors">BBB</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">A Fazenda</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">MasterChef</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Outros Shows</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-neon-green rounded-full"></span>
              Institucional
            </h3>
            <ul className="space-y-4 text-zinc-400">
              <li><a href="#" className="hover:text-neon-green transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4 text-zinc-600 text-sm">
          <p>© 2026 RealityVote Portal. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <span>Powered by Gemini AI Studio</span>
            <span className="text-zinc-500 font-medium">#RealityVote</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
