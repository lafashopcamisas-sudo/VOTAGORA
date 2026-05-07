import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Trash2, User, Flame, Camera, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from "../lib/firebase";
import { updateProfile } from "firebase/auth";
import { Skeleton, CommentSkeleton } from "./Skeleton";
import { 
  collection, 
  addDoc, 
  getDocs,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
  where,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";

interface Comment {
  id: string;
  pollId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes?: string[];
  dislikes?: string[];
  createdAt: any;
}

interface CommentsSectionProps {
  pollId?: string;
}

export default function CommentsSection({ pollId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  const COMMENTS_PER_PAGE = 5;

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    fetchInitialComments();

    return () => {
      unsubscribeAuth();
    };
  }, [pollId]);

  const fetchInitialComments = async () => {
    setLoading(true);
    try {
      const commentsCol = collection(db, "comments");
      const q = query(
        commentsCol,
        where("pollId", "==", pollId || null),
        orderBy("createdAt", "desc"),
        limit(COMMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      setComments(fetchedComments);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "comments");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (!lastDoc || loadingMore) return;

    setLoadingMore(true);
    try {
      const commentsCol = collection(db, "comments");
      const q = query(
        commentsCol,
        where("pollId", "==", pollId || null),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(COMMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const moreComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      setComments(prev => [...prev, ...moreComments]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "comments/more");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!user) {
      // For simplicity in this demo, we'll suggest they are anonymous or prompt login
      // But based on App.tsx, there's an initAuth. 
      // Let's assume they need to be logged in.
      alert("Por favor, faça login para comentar.");
      return;
    }

    setIsSubmitting(true);
    const commentId = crypto.randomUUID();
    
    try {
      const commentData = {
        id: commentId,
        pollId: pollId || null,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Usuário Anônimo",
        userAvatar: user.photoURL || "",
        text: newComment.trim(),
        likes: [],
        dislikes: [],
        createdAt: new Date() // Fallback literal for instant display
      };

      await setDoc(doc(db, "comments", commentId), {
        ...commentData,
        createdAt: serverTimestamp()
      });
      
      // Update local state manually for instant feedback
      setComments(prev => [commentData as Comment, ...prev]);
      setNewComment("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "comments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir seu comentário?")) return;
    
    try {
      await deleteDoc(doc(db, "comments", id));
      // Update local state manually
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${id}`);
    }
  };

  const handleReaction = async (comment: Comment, type: 'like' | 'dislike') => {
    if (!user) {
      alert("Faça login para reagir aos comentários.");
      return;
    }

    const commentRef = doc(db, "comments", comment.id);
    const userId = user.uid;
    
    let currentLikes = [...(comment.likes || [])];
    let currentDislikes = [...(comment.dislikes || [])];

    if (type === 'like') {
      if (currentLikes.includes(userId)) {
        currentLikes = currentLikes.filter(id => id !== userId);
      } else {
        currentLikes.push(userId);
        currentDislikes = currentDislikes.filter(id => id !== userId);
      }
    } else {
      if (currentDislikes.includes(userId)) {
        currentDislikes = currentDislikes.filter(id => id !== userId);
      } else {
        currentDislikes.push(userId);
        currentLikes = currentLikes.filter(id => id !== userId);
      }
    }

    try {
      await setDoc(commentRef, {
        ...comment,
        likes: currentLikes,
        dislikes: currentDislikes
      }, { merge: true });
      
      // Update local state manually
      setComments(prev => prev.map(c => 
        c.id === comment.id 
          ? { ...c, likes: currentLikes, dislikes: currentDislikes } 
          : c
      ));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${comment.id}`);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 1024 * 1024 * 2) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateProfile(user, { photoURL: base64String });
        // Refresh local user state
        setUser({ ...user, photoURL: base64String } as any);
      } catch (error) {
        console.error("Erro ao atualizar avatar:", error);
        alert("Ocorreu um erro ao salvar seu avatar.");
      } finally {
        setIsUploadingAvatar(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Agora mesmo";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    }).format(date);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mt-20 mb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-reality-red/10 flex items-center justify-center border border-reality-red/20 shadow-xl">
          <MessageSquare className="w-5 h-5 text-reality-red" />
        </div>
        <div>
          <h3 className="text-2xl font-display text-white uppercase tracking-tighter">Espaço do <span className="text-reality-red">Fã</span></h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mt-1">Deixe sua opinião sobre o reality</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Comment Input */}
        <div className="lg:col-span-4 sticky top-36">
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-reality-red/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="mb-6 flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/10 bg-zinc-900 flex items-center justify-center relative shadow-2xl transition-transform group-hover:scale-105">
                  {isUploadingAvatar ? (
                    <Loader2 className="w-8 h-8 text-reality-red animate-spin" />
                  ) : user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-zinc-700" />
                  )}
                  
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[10px] text-white font-black uppercase tracking-widest">{user?.displayName || "Seu Perfil"}</p>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Clique para mudar o avatar</p>
                </div>
              </div>
            </div>

            <h4 className="text-white font-display text-xl uppercase mb-6 flex items-center gap-2">
              <Flame className="w-4 h-4 text-reality-red" />
              O que você está achando?
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva seu comentário aqui..."
                  className="w-full h-32 bg-zinc-950/50 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-reality-red/50 transition-colors resize-none"
                  maxLength={1000}
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-black text-zinc-700 tracking-widest uppercase">
                  {newComment.length}/1000
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="w-full py-4 bg-reality-red text-white font-display text-lg uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-reality-red/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Enviando..." : (
                  <>
                    Publicar Comentário
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] leading-relaxed">
                Respeite as regras da comunidade. Comentários ofensivos ou spam serão removidos.
              </p>
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <AnimatePresence initial={false} mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CommentSkeleton />
              </motion.div>
            ) : comments.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center italic text-zinc-600"
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 opacity-20" />
                </div>
                Seja o primeiro a comentar!
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 bg-zinc-900 flex items-center justify-center">
                        {comment.userAvatar ? (
                          <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-zinc-700" />
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-display text-lg uppercase tracking-tight">{comment.userName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
                            {user?.uid === comment.userId && (
                              <button 
                                onClick={() => handleDelete(comment.id)}
                                className="text-zinc-600 hover:text-reality-red transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                          {comment.text}
                        </p>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleReaction(comment, 'like')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              comment.likes?.includes(user?.uid || "")
                                ? "bg-reality-red text-white"
                                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${comment.likes?.includes(user?.uid || "") ? "fill-white" : ""}`} />
                            {comment.likes?.length || 0}
                          </button>

                          <button
                            onClick={() => handleReaction(comment, 'dislike')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              comment.dislikes?.includes(user?.uid || "")
                                ? "bg-zinc-700 text-white"
                                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                            }`}
                          >
                            <ThumbsDown className={`w-3 h-3 ${comment.dislikes?.includes(user?.uid || "") ? "fill-white" : ""}`} />
                            {comment.dislikes?.length || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {hasMore && (
                  <button
                    onClick={loadMoreComments}
                    disabled={loadingMore}
                    className="w-full py-6 mt-4 glass border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-3 group"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin text-reality-red" />
                    ) : (
                      <>
                        Ver comentários mais antigos
                        <div className="w-6 h-[1px] bg-white/10 group-hover:bg-reality-red group-hover:w-10 transition-all"></div>
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
