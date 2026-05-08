import { Poll } from "./types";

export const INITIAL_POLLS: Poll[] = [
  {
    id: "poll-patrao",
    question: "QUEM VAI SER ELIMINADO",
    category: "CASA DO PATRÃO",
    status: "active",
    totalVotes: 985965,
    createdAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1580587767523-120518ad2822?auto=format&fit=crop&q=80&w=1200",
    options: [
      { id: "opt-LUIZA", label: "LUIZA", votes: 350000, imageUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-SHEILA", label: "SHEILA", votes: 28000, imageUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-THIAGO", label: "THIAGO", votes: 12000, imageUrl: "https://cloudfront-us-east-1.images.arcpublishing.com/newr7/QG5CIEJV6BF6JHVOQLXMGFXLHI.png" },
    ],
  },
  {
    id: "poll-1",
    question: "Quem deve sair do Paredão hoje?",
    category: "BBB",
    status: "active",
    totalVotes: 1_254_210,
    createdAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200",
    options: [
      { id: "opt-1", label: "Marcus", votes: 450000, imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-2", label: "Leandra", votes: 620000, imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-3", label: "Davi", votes: 120000, imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-4", label: "Bia", votes: 64210, imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400" },
    ],
  },
  {
    id: "poll-2",
    question: "Quem é seu favorito na Fazenda?",
    category: "A Fazenda",
    status: "active",
    totalVotes: 890450,
    createdAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    options: [
      { id: "opt-a", label: "Tiago", votes: 310000, imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-b", label: "Gabi", votes: 420000, imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-c", label: "Lucas", votes: 110000, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-d", label: "Ana", votes: 50450, imageUrl: "https://images.unsplash.com/photo-1517841905240-472988bad1fa?auto=format&fit=crop&q=80&w=400" },
    ],
  },
  {
    id: "poll-3",
    question: "Quem jogou melhor esta semana?",
    category: "Outros",
    status: "active",
    totalVotes: 432100,
    createdAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1461896704075-9775b72b988d?auto=format&fit=crop&q=80&w=1200",
    options: [
      { id: "opt-x", label: "Robson", votes: 150000, imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-y", label: "Carla", votes: 120000, imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-z", label: "Luan", votes: 80000, imageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=400" },
      { id: "opt-w", label: "Julia", votes: 82100, imageUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400" },
    ],
  },
];
