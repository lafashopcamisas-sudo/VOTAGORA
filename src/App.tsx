/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PollCard from "./components/PollCard";
import PollDetail from "./components/PollDetail";
import RankingView from "./components/RankingView";
import CommentsSection from "./components/CommentsSection";
import AdSection from "./components/AdBanner";
import NewsGrid from "./components/NewsGrid";
import { PollCardSkeleton, MainPollSkeleton } from "./components/Skeleton";
import { INITIAL_POLLS } from "./constants";
import { Poll, VoteRecord, Option, Ad, News } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Star, Sparkles, Search, X, ChevronRight } from "lucide-react";
import { 
  db, 
  auth, 
  initAuth, 
  handleFirestoreError, 
  OperationType 
} from "./lib/firebase";
import { 
  collection, 
  doc, 
  onSnapshot, 
  runTransaction, 
  serverTimestamp, 
  increment,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

export default function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [user, setUser] = useState(auth.currentUser);
  const [userVotes, setUserVotes] = useState<VoteRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [adsLoading, setAdsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [showNewPollToast, setShowNewPollToast] = useState(false);

  // Sync polls with momentPoll and check for "new" status
  useEffect(() => {
    const momentPoll = polls.length > 0 ? polls[0] : null;
    if (momentPoll) {
      const lastSeenId = localStorage.getItem('lastSeenPollId');
      if (lastSeenId && lastSeenId !== momentPoll.id) {
        setShowNewPollToast(true);
      }
      localStorage.setItem('lastSeenPollId', momentPoll.id);
    }
  }, [polls]);

  const handleShareWhatsApp = (poll: Poll) => {
    const text = `🚨 VOTAÇÃO ABERTA! 🚨\n\n*${poll.question}*\n\nVote agora no Votagora e veja a parcial em tempo real! 👇\n\n${window.location.origin}/?poll=${poll.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTwitter = (poll: Poll) => {
    const text = `Votação ativa: ${poll.question} - Participe agora no VOTAGORA! 🔥`;
    const url = `${window.location.origin}/?poll=${poll.id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareFacebook = (poll: Poll) => {
    const url = `${window.location.origin}/?poll=${poll.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    initAuth();
    return () => unsubscribe();
  }, []);

  // Sync Polls from Firestore
  useEffect(() => {
    const pollsCol = collection(db, "polls");
    
    const unsubscribe = onSnapshot(pollsCol, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data if empty
        console.log("Seeding initial polls...");
        for (const pollData of INITIAL_POLLS) {
          const pollRef = doc(db, "polls", pollData.id);
          const { options, ...metadata } = pollData;
          await setDoc(pollRef, metadata);
          for (const opt of options) {
            await setDoc(doc(db, "polls", pollData.id, "options", opt.id), opt);
          }
        }
        return;
      }

      const pollsData: Poll[] = [];
      for (const pollDoc of snapshot.docs) {
        const data = pollDoc.data() as Omit<Poll, 'options'>;
        // Fetch options subcollection for each poll
        const optionsSnap = await getDocs(collection(db, "polls", pollDoc.id, "options"));
        const options = optionsSnap.docs.map(d => d.data() as Option);
        pollsData.push({ ...data, id: pollDoc.id, options });
      }
      setPolls(pollsData);
      setLoading(false);

      // Handle query param for sharing
      const urlParams = new URLSearchParams(window.location.search);
      const pollId = urlParams.get('poll');
      if (pollId && !selectedPollId) {
        setSelectedPollId(pollId);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "polls");
    });

    return () => unsubscribe();
  }, []);

  // Sync Ads from Firestore
  useEffect(() => {
    const adsCol = collection(db, "ads");
    
    const unsubscribe = onSnapshot(adsCol, (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      setAds(adsData);
      setAdsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "ads");
      setAdsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync News from Firestore
  useEffect(() => {
    const newsCol = collection(db, "news");
    const q = query(newsCol, orderBy("createdAt", "desc"), limit(6));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as News[];
      setNews(newsData);
      setNewsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "news");
      setNewsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync User Votes from Firestore
  useEffect(() => {
    if (!user) return;

    const votesCol = collection(db, "userVotes");
    const q = query(votesCol, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          pollId: data.pollId,
          optionId: data.optionId,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      });
      setUserVotes(votes);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "userVotes");
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!auth.currentUser) {
      await initAuth();
    }
    const userId = user?.uid;
    if (!userId) return;

    // Local check first for UI speed
    if (userVotes.some(v => v.pollId === pollId)) return;

    const voteDocRef = doc(db, "userVotes", `${pollId}_${userId}`);
    const pollRef = doc(db, "polls", pollId);
    const optionRef = doc(db, "polls", pollId, "options", optionId);

    try {
      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteDocRef);
        if (voteDoc.exists()) {
          throw new Error("ALREADY_VOTED");
        }

        transaction.set(voteDocRef, {
          pollId,
          optionId,
          userId,
          timestamp: serverTimestamp()
        });

        transaction.update(pollRef, {
          totalVotes: increment(1)
        });

        transaction.update(optionRef, {
          votes: increment(1)
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ALREADY_VOTED") {
        return;
      }
      handleFirestoreError(error, OperationType.WRITE, `polls/${pollId}`);
    }
  };

  const activePoll = selectedPollId ? polls.find(p => p.id === selectedPollId) : null;
  const filteredPolls = polls.filter(p => 
    p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Votos Hoje", value: "842k", icon: <Flame className="w-5 h-5 text-reality-red" /> },
    { label: "Online", value: "1.2k", icon: <Star className="w-5 h-5 text-white" /> },
    { label: "Ativas", value: polls.length.toString(), icon: <Sparkles className="w-5 h-5 text-reality-red" /> },
  ];

  const momentPoll = polls.length > 0 ? polls[0] : null;
  const topPolls = polls.length > 1 ? polls.slice(1) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      {/* Breaking News Ticker */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-reality-red/10 backdrop-blur-md border-b border-white/5 py-2 overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex items-center gap-12"
        >
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-1.5 h-1.5 rounded-full bg-reality-red animate-pulse"></span>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">
                Última Hora: Novo favorito desponta na pesquisa de hoje! 🔥
              </span>
              <span className="text-zinc-600 font-bold uppercase text-[9px]">Portal Votagora</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">
                Novas Parciais Confirmadas: Diferença cai para menos de 1% entre os emparedados! 🚨
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <Header 
        currentTab={currentTab} 
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setSelectedPollId(null);
          window.scrollTo(0, 0);
        }} 
      />

      <AnimatePresence>
        {showNewPollToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[90%]"
          >
            <div className="glass p-6 rounded-3xl border border-reality-red shadow-[0_20px_50px_rgba(227,6,19,0.3)] flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-reality-red/10 flex items-center justify-center flex-shrink-0">
                <Flame className="w-6 h-6 text-reality-red animate-pulse" />
              </div>
              <div className="flex-grow">
                <p className="text-[10px] text-reality-red font-black uppercase tracking-widest mb-1">Nova Enquete</p>
                <p className="text-white font-display text-lg uppercase leading-tight">Uma nova votação acaba de ser aberta!</p>
              </div>
              <button 
                onClick={() => {
                  setShowNewPollToast(false);
                  if (momentPoll) setSelectedPollId(momentPoll.id);
                }}
                className="p-3 bg-white text-black rounded-xl hover:scale-105 transition-transform"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowNewPollToast(false)}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 text-zinc-500 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-32 pb-12">
        {/* Official Site Banner */}
        {currentTab === "home" && !selectedPollId && (
          <section className="max-w-7xl mx-auto px-4 mb-4">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-12px_rgba(227,6,19,0.3)] border border-white/5"
             >
              <a href="https://ibb.co/bjKmPNnk" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://i.ibb.co/0VvNj0Lx/BANNER-PRINCIPAL-CASA-DO-PATRAO.png" 
                  alt="Votagora Official Banner" 
                  className="w-full h-auto object-cover min-h-[150px]" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </a>
             </motion.div>
          </section>
        )}

        {/* Main Content: Parciais + Main Poll Grid */}
        {currentTab === "home" && !selectedPollId && (
          <section className="max-w-7xl mx-auto px-4 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Parciais Section (Left/Main) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-8 glass rounded-[2.5rem] overflow-hidden border border-white/5 p-6 md:p-8 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-reality-red rounded-full"></div>
                    <<h2 className="text-2xl md:text-3xl font-display text-white uppercase tracking-tighter">
  Parciais dos <span className="text-reality-red">Principais Portais</span>
</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-reality-red opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-reality-red"></span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Atualizado agora</span>
                  </div>
                </div>
                
                <div className="flex-grow rounded-2xl overflow-hidden bg-zinc-950/50 flex items-center justify-center relative shadow-inner group">
                  <a href="https://ibb.co/nqMGgR9g" target="_blank" rel="noopener noreferrer" className="w-full h-full flex">
                    <img 
                      src="https://i.ibb.co/Pv1hy2Ky/cp-pesquisa-07-05.png" 
                      alt="Parciais Outros Sites" 
                      className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-1000" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </a>
                  <div className="absolute inset-x-0 bottom-0 py-6 px-10 bg-gradient-to-t from-black to-transparent pointer-events-none">
                    <p className="text-white/60 text-[9px] uppercase font-bold tracking-[0.3em] text-center">
                      MÉDIA PONDERADA DOS PRINCIPAIS PORTAIS DE NOTÍCIAS DO BRASIL
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Main Poll Card (Right/Sidebar) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-4 flex flex-col gap-6"
              >
                {loading ? (
                  <MainPollSkeleton />
                ) : momentPoll ? (
                  <div className="glass rounded-[2.5rem] border border-reality-red/20 p-6 md:p-8 flex flex-col h-full bg-gradient-to-b from-reality-red/[0.03] to-transparent">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-reality-red/10 border border-reality-red/20 rounded-lg mb-6 w-fit">
                      <Flame className="w-3 h-3 text-reality-red" />
                      <span className="text-[9px] font-black text-reality-red uppercase tracking-widest">ENQUETE OFICIAL</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-display text-white uppercase leading-[0.9] mb-4">
                      {momentPoll.question}
                    </h3>

                    <div className="aspect-square rounded-2xl overflow-hidden mb-6 relative">
                      <img 
                        src={momentPoll.imageUrl} 
                        alt="Ação" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Votação controlada por IP</p>
                      </div>
                    </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-reality-red/10 flex items-center justify-center border border-reality-red/20 shadow-xl">
                      <Flame className="w-6 h-6 text-reality-red animate-pulse" />
                    </div>
                    <div>
                      <p className="text-white font-display text-xl leading-none">VOTAÇÃO OFICIAL</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Verificada</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display text-white leading-none">{momentPoll.totalVotes?.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Total de Participantes</p>
                  </div>
                </div>

                    <button 
                      onClick={() => setSelectedPollId(momentPoll.id)}
                      className="w-full py-4 bg-white text-black font-display text-xl uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all shadow-xl mt-auto"
                    >
                      VOTAR AGORA
                    </button>
                  </div>
                ) : (
                  <div className="glass rounded-[2.5rem] border border-white/5 p-8 flex items-center justify-center h-full italic text-zinc-600">
                    Carregando enquete principal...
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* Secondary "Winner" Poll Section */}
        {currentTab === "home" && !selectedPollId && polls.length > 1 && (
          <section className="max-w-7xl mx-auto px-4 mb-16">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative py-12 px-8 md:px-16 rounded-[3rem] bg-gradient-to-r from-zinc-900 to-black border border-white/5 overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-reality-red/50 to-transparent"></div>
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                <div className="max-w-xl text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                    <Sparkles className="w-5 h-5 text-reality-red" />
                    <span className="text-reality-red font-black text-[10px] uppercase tracking-[0.3em]">Favorito do Público</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-display text-white uppercase tracking-tight mb-4">
                    QUEM MERECE GANHAR <span className="reality-gradient-text">A TEMPORADA?</span>
                  </h3>
                  <p className="text-zinc-500 font-medium">
                    Acompanhe quem está na frente para levar o prêmio final. Uma parcial exclusiva Votagora.
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                  {polls.find(p => p.category.toLowerCase().includes("vencer") || p.question.toLowerCase().includes("ganhar")) ? (
                    <button 
                      onClick={() => setSelectedPollId(polls.find(p => p.category.toLowerCase().includes("vencer") || p.question.toLowerCase().includes("ganhar"))?.id || "")}
                      className="px-12 py-5 glass text-white font-display text-2xl uppercase tracking-widest rounded-2xl hover:bg-reality-red hover:border-reality-red transition-all shadow-2xl"
                    >
                      ABRIR PARCIAL FINAL
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedPollId(polls[polls.length - 1].id)}
                      className="px-12 py-5 glass text-white font-display text-2xl uppercase tracking-widest rounded-2xl hover:bg-reality-red hover:border-reality-red transition-all shadow-2xl"
                    >
                      VER FAVORITO
                    </button>
                  )}
                  <div className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Enquete de longo prazo</div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Ad Section */}
        {currentTab === "home" && !selectedPollId && (
          <section className="max-w-7xl mx-auto px-4">
            <AdSection ads={ads} loading={adsLoading} />
          </section>
        )}

        {/* Breaking News Section */}
        {currentTab === "home" && !selectedPollId && (
          <section className="max-w-7xl mx-auto px-4 mb-24">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-reality-red"></div>
                <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest">Acontecendo Agora</h3>
              </div>
              <button 
                onClick={() => setCurrentTab("news")}
                className="text-[10px] font-black uppercase tracking-widest text-reality-red hover:text-white transition-colors"
              >
                Ver tudo
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsLoading ? (
                Array(3).fill(null).map((_, i) => (
                  <div key={i} className="glass rounded-[2rem] border border-white/5 h-64 animate-pulse" />
                ))
              ) : (
                news.slice(0, 3).map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setCurrentTab("news")}
                    className="glass rounded-3xl overflow-hidden border border-white/5 cursor-pointer group hover:border-reality-red/30 transition-all flex flex-col h-full"
                  >
                    <div className="h-44 overflow-hidden relative">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      {item.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-reality-red/90 backdrop-blur-sm text-[8px] font-black text-white rounded-full uppercase tracking-widest">{item.category}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        {new Date(item.createdAt?.seconds * 1000 || item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h4 className="text-white font-display text-lg mt-3 group-hover:text-reality-red transition-colors line-clamp-2 uppercase leading-tight">{item.title}</h4>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {currentTab === "home" && !selectedPollId && (
          <CommentsSection />
        )}

        <div className="bg-reality-red overflow-hidden whitespace-nowrap py-3">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-10"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-white font-black text-[10px] uppercase tracking-[0.3em]">
                PARTICIPE, VOTE E DESCUBRA QUEM SAI ANTES DE TODO MUNDO! 🔥
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {selectedPollId && activePoll ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PollDetail 
                poll={activePoll}
                onBack={() => setSelectedPollId(null)}
                onVote={handleVote}
                hasVoted={userVotes.some(v => v.pollId === activePoll.id)}
                votedOptionId={userVotes.find(v => v.pollId === activePoll.id)?.optionId}
              />
            </motion.div>
          ) : currentTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-20"
            >
              {/* Secondary Sections Ticker */}
              <div className="bg-reality-red overflow-hidden whitespace-nowrap py-3 mb-10">
                <motion.div 
                  animate={{ x: [0, -1000] }}
                  transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                  className="flex items-center gap-10"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="text-white font-black text-[10px] uppercase tracking-[0.3em]">
                      PARTICIPE DA VOTAÇÃO QUE O BRASIL TODO ESTÁ ACOMPANHANDO! 🔥
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Other Polls Section */}
              <section className="max-w-7xl mx-auto px-4 mb-24 relative z-10">
                <div className="flex items-center gap-4 mb-12">
                  <h2 className="text-2xl md:text-5xl font-display text-white tracking-tighter uppercase shrink-0">OUTRAS <span className="text-reality-red">VOTAÇÕES</span></h2>
                  <div className="h-[1px] bg-zinc-800 flex-grow"></div>
                  <div className="flex gap-2 shrink-0">
                    <div className="p-3 glass rounded-xl border-white/10 opacity-50"><Search className="w-5 h-5" /></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {loading ? (
                    [1,2,3,4,5,6].map(i => <PollCardSkeleton key={i} />)
                  ) : (
                      topPolls.map((poll) => (
                        <PollCard 
                          key={poll.id} 
                          poll={poll} 
                          onClick={setSelectedPollId}
                          onVote={handleVote}
                          hasVoted={userVotes.some(v => v.pollId === poll.id)}
                          onShareWhatsApp={handleShareWhatsApp}
                          onShareTwitter={handleShareTwitter}
                          onShareFacebook={handleShareFacebook}
                        />
                      ))
                  )}
                </div>
              </section>

              {/* Realities You Follow Section */}
              <section className="max-w-7xl mx-auto px-4 mb-24">
                <div className="glass p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-reality-red/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="text-2xl font-display text-white mb-8 uppercase tracking-widest text-center">REALITIES QUE VOCÊ ACOMPANHA</h3>
                      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                        {[
                          { name: "BBB", icon: "👁️" },
                          { name: "A FAZENDA", icon: "🏠" },
                          { name: "POWER COUPLE", icon: "❤️" },
                          { name: "NO LIMITE", icon: "🔥" },
                          { name: "ESTRELA DA CASA", icon: "⭐" },
                          { name: "OUTROS", icon: "•••" }
                        ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-4 group cursor-pointer">
                        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-reality-red/20 group-hover:border-reality-red/40 transition-all shadow-xl">
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Brand Banner (Red Style) */}
              <section className="max-w-7xl mx-auto px-4 mt-24 mb-20">
                <div className="relative h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden group border border-white/5 shadow-2xl">
                  <div className="absolute inset-0 bg-[#0A0A0A]"></div>
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-black flex justify-center items-center">
                    <img src="/input_file_1.png" className="w-full h-full object-cover grayscale opacity-50" alt="Background" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-reality-red/80 via-black to-black p-8 md:p-20 flex flex-col justify-center">
                    <div className="max-w-2xl">
                      <h2 className="text-4xl md:text-7xl font-display text-white mb-6 uppercase tracking-tight leading-[0.85]">O SEU VOTO TEM PODER. <span className="text-reality-red">PARTICIPE!</span></h2>
                      <p className="text-zinc-400 font-bold uppercase text-xs md:text-sm tracking-[0.2em] mb-10 max-w-lg">
                        Milhares de pessoas votando todos os dias com segurança e transparência total nos dados.
                      </p>
                      <button className="px-10 py-5 bg-reality-red text-white font-display text-2xl uppercase tracking-widest rounded-2xl shadow-reality-red/20 shadow-xl hover:scale-105 active:scale-95 transition-all">
                        EXPLORAR TODAS ENQUETES
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : currentTab === "news" ? (
            <motion.div
              key="news"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-10"
            >
              <section className="max-w-7xl mx-auto px-4 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-[2px] bg-reality-red"></div>
                      <span className="text-reality-red text-xs font-black uppercase tracking-[0.3em]">Plantão Reality</span>
                    </div>
                    <h2 className="text-white font-display text-4xl md:text-6xl uppercase tracking-tighter leading-none">
                      Acontecimentos <span className="text-reality-red block md:inline text-stroke-white opacity-40">Recentes</span>
                    </h2>
                  </div>
                  <p className="text-zinc-500 text-sm max-w-md font-medium border-l border-white/10 pl-6 italic">
                    Siga em tempo real os desdobramentos que estão agitando a casa agora mesmo. Atualizações constantes do Portal Votagora.
                  </p>
                </div>

                <NewsGrid news={news} loading={newsLoading} />
              </section>
            </motion.div>
          ) : currentTab === "ranking" ? (
            <motion.div
              key="ranking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-10"
            >
              <RankingView polls={polls} loading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto py-20 px-4 text-center"
            >
              <h2 className="text-4xl font-display gold-text mb-4 uppercase">Enquetes Encerradas</h2>
              <p className="text-zinc-500 mb-12">Confira o histórico de votações e quem levou a melhor.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-60 grayscale filter">
                {/* Visual placeholder for closed polls */}
                <div className="p-12 glass rounded-3xl border-dashed border-2 flex flex-col items-center justify-center min-h-[300px]">
                  <p className="text-zinc-600 font-bold uppercase tracking-widest">Nenhuma enquete encerrada recentemente</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
