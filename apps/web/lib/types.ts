// Types matching backend Prisma schema

export type Role = 'USER' | 'ADMIN';
export type ContestType = 'DEV' | 'DSA';
export type ContestStatus = 'UPCOMING' | 'LIVE' | 'CLOSED';
export type ContestMode = 'real' | 'practice';
export type ContestState = 'LIVE' | 'UPCOMING' | 'PRACTICE';
export type MCQOption = 'A' | 'B' | 'C' | 'D';

export interface User {
  id: string;
  name: string;
  email: string | null;
  role: Role;
  CreatedAt?: string;
}

export interface Contest {
  id: string;
  srNo: number;
  title: string;
  discription: string;
  type: ContestType;
  status: ContestStatus;
  createdBy: string;
  StartDate?: string;
  StartTime?: string;
  ContestTotalTime?: number;
  mode: ContestMode;
  MCQ?: MCQ[];
  codeQ?: CodeQuestion[];
  leaderboard?: Leaderboard;
}

export interface Leaderboard {
  id: string;
  score: Score[];
  isFinaLized?: boolean;
}

export interface MCQ {
  id: string;
  srNo: number;
  question: string;
  Solution: MCQOption;
  contestId: string;
  createdAt?: string;
  points: number;
  avgTTinMins: number;
}

export interface CodeQuestion {
  id: string;
  srNo: number;
  question: string;
  Solution: string;
  contestId: string;
  avgTTinMins: number;
}

export interface Score {
  id: string;
  user: string;
  Rank: string;
  TotalScore?: number;
  leaderboardId: string;
}

// Unified LeaderboardEntry — single source of truth
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalPoints: number;
  previousRank?: number;
  isCurrentUser?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // Answer submission fields
  isCorrect?: boolean;
  correctAnswer?: string;
  // Contest state from getContest
  mode?: ContestState;
}

export interface AuthResponse {
  token: string;
}



export interface CreateContestData {
  title: string;
  discription: string;
  type: ContestType;
  status: ContestStatus;
  StartTime: Date;
  ContestTotalTime?: number;
  mode?: 'real' | 'practice';
}

export interface CreateMCQData {
  contestId: string;
  question: string;
  Soltion: MCQOption;
  createdAt: Date;
  points: number;
  avgTTinMins?: number;
}

// WebSocket message types
export interface WSMessage {
  type: 'init_contest' | 'join_contest' | 'leave_contest' | 'submit_answer' | 'finalizeContest';
  contestId?: string;
  questionId?: string;
  answer?: MCQOption;
}

// Minimal MCQ returned from GetContest API (no question/solution - anti-cheat)
export interface MCQMeta {
  id: string;
  contestId: string;
}

// Full question received from WebSocket (no solution - anti-cheat)
export interface WSQuestion {
  id: string;
  srNo: number;
  question: string;
  createdAt: string | null;
  points: number;
  avgTTinMins: number;
}
