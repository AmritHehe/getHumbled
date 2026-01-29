// Types matching backend Prisma schema

export type Role = 'USER' | 'ADMIN';
export type ContestType = 'DEV' | 'DSA';
export type ContestStatus = 'UPCOMING' | 'LIVE' | 'CLOSED';
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
  MCQ?: MCQ[];
  codeQ?: CodeQuestion[];
  leaderboard?: Leaderboard;
}

export interface Leaderboard {
  id: string;
  score: Score[];
}

export interface Score {
  id: string;
  user: string; // This is actually the username string in schema?? 'user String'
  Rank: string;
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

export interface LeaderBoard {
  id: string;
  contestId: string;
  score: Score[];
}

export interface Score {
  id: string;
  user: string;
  Rank: string;
  leaderboardId: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface SignInData {
  email: string;
  password: string;
  role: Role;
}

export interface CreateContestData {
  title: string;
  discription: string;
  type: ContestType;
  status: ContestStatus;
  StartTime: Date;
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
  type: 'join_contest' | 'leave_contest' | 'submit_answer';
  contestId?: string;
  questionId?: string;
  answer?: MCQOption;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  rank: number;
}
