/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Option {
  id: string;
  label: string;
  votes: number;
  imageUrl?: string;
}

export interface Poll {
  id: string;
  question: string;
  category: "BBB" | "A Fazenda" | "Outros";
  status: "active" | "closed";
  options: Option[];
  totalVotes: number;
  createdAt: string;
  imageUrl: string;
}

export interface VoteRecord {
  pollId: string;
  optionId: string;
  timestamp: string;
}

export interface Ad {
  id: string;
  imageUrl: string;
  link: string;
  title: string;
  description?: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category?: string;
  createdAt: any;
}
