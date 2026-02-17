import axios from 'axios';
import type { ApiResponse, AuthResponse, Contest, SignInData, SignUpData, CreateContestData, CreateMCQData } from './types';

const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
http.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Unwrap axios response → just return the data
http.interceptors.response.use(
    (res) => res.data,
    (err) => ({ success: false, error: err.response?.data?.error || err.message })
);

function setToken(token: string | null) {
    if (typeof window === 'undefined') return;
    token ? localStorage.setItem('token', token) : localStorage.removeItem('token');
}

function getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

async function signUp(data: Omit<SignUpData, 'role'>) {
    return http.post('/user/signUp', { ...data, role: 'USER' }) as any as ApiResponse<{ name: string; email: string }>;
}

async function signIn(data: Omit<SignInData, 'role'>) {
    const res = await http.post('/user/signIn', { ...data, role: 'USER' }) as any as ApiResponse<AuthResponse>;
    if (res.success && res.data?.token) setToken(res.data.token);
    return res;
}

async function adminSignUp(data: Omit<SignUpData, 'role'>) {
    return http.post('/signUp', { ...data, role: 'ADMIN' }) as any as ApiResponse<{ name: string; email: string }>;
}

async function adminSignIn(data: Omit<SignInData, 'role'>) {
    const res = await http.post('/signin', { ...data, role: 'ADMIN' }) as any as ApiResponse<AuthResponse>;
    if (res.success && res.data?.token) setToken(res.data.token);
    return res;
}

function signOut() {
    setToken(null);
}

function getContests(filters?: { status?: 'UPCOMING' | 'LIVE' | 'CLOSED'; mode?: 'real' | 'practice' }) {
    const endpoint = getToken() ? '/contests' : '/contests/public';
    return http.post(endpoint, filters || {}) as any as Promise<ApiResponse<Contest[]>>;
}

function getContest(contestId: string) {
    const endpoint = getToken() ? '/getContest' : '/contest/public';
    return http.post(endpoint, { contestId }) as any as Promise<ApiResponse<Contest>>;
}

function createContest(data: CreateContestData) {
    return http.post('/contests/new', data) as any as Promise<ApiResponse<{ contestId: string }>>;
}

function createMCQ(data: CreateMCQData) {
    return http.post('/question/new', data) as any as Promise<ApiResponse<void>>;
}

function createQuestionsWithAI(data: { prompt: string; contestId: string; mode?: 'real' | 'practice' }) {
    return http.post('/CreateContestAI', data) as any as Promise<ApiResponse<{ count: number }>>;
}

function joinPracticeContest(contestId: string) {
    return http.post('/contests/practice/join', { contestId }) as any as Promise<ApiResponse<{ randomQuestion: any }>>;
}

function submitPracticeAnswer(contestId: string, questionId: string, answer: string) {
    return http.post('/contests/practice/submit', { contestId, questionId, answer }) as any as Promise<ApiResponse<{ randomQuestion: any }>>;
}

function reAttemptPracticeContest(contestId: string) {
    return http.post('/contests/reattempt', { contestId }) as any as Promise<ApiResponse<any>>;
}



export const api = {
    setToken,
    getToken,
    signUp,
    signIn,
    adminSignUp,
    adminSignIn,
    signOut,
    getContests,
    getContest,
    createContest,
    createMCQ,
    createQuestionsWithAI,
    joinPracticeContest,
    submitPracticeAnswer,
    reAttemptPracticeContest,
};
