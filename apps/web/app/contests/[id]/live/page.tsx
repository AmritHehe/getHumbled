'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { api } from '@/lib/api';
import type { Contest, MCQOption, WSQuestion } from '@/lib/types';
import toast from 'react-hot-toast';
import { formatTime } from '@/lib/utils';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    totalPoints: number;
    previousRank?: number;
}

function parseQuestion(rawQuestion: string, srNo: number) {
    const parts = rawQuestion.split('\n\nOptions:\n');
    const questionText = parts[0];

    let options = [
        { key: 'A' as MCQOption, text: '' },
        { key: 'B' as MCQOption, text: '' },
        { key: 'C' as MCQOption, text: '' },
        { key: 'D' as MCQOption, text: '' },
    ];

    if (parts.length > 1) {
        const optionsLines = parts[1].split('\n');
        options = options.map(opt => {
            const line = optionsLines.find(l => l.startsWith(opt.key + ')'));
            return {
                ...opt,
                text: line ? line.substring(3).trim() : ''
            };
        });
    }

    return {
        id: `q${srNo}`,
        question: questionText,
        options,
    };
}

export default function LiveContestPage() {
    const params = useParams();
    const router = useRouter();
    const contestId = params.id as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // New state for sequential question flow
    const [currentQuestion, setCurrentQuestion] = useState<WSQuestion | null>(null);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<MCQOption | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isCompleted, setIsCompleted] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const [timeTaken, setTimeTaken] = useState(0);

    // WebSocket state
    const wsRef = useRef<WebSocket | null>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userScore, setUserScore] = useState(0);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const previousLeaderboardRef = useRef<Map<string, number>>(new Map());

    // Get user ID from token on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserId(payload.userId);
                } catch { }
            }
        }
    }, []);

    // Transform backend leaderboard format to frontend format
    const transformLeaderboard = useCallback((data: { value: string; score: number }[]) => {
        if (!data || !Array.isArray(data)) return [];

        const prevRanks = previousLeaderboardRef.current;
        const newEntries: LeaderboardEntry[] = data.map((entry, idx) => ({
            rank: idx + 1,
            userId: entry.value,
            userName: entry.value,
            totalPoints: entry.score,
            previousRank: prevRanks.get(entry.value),
        }));

        const newPrevRanks = new Map<string, number>();
        newEntries.forEach(e => newPrevRanks.set(e.userId, e.rank));
        previousLeaderboardRef.current = newPrevRanks;

        return newEntries;
    }, []);

    // Get current user ID from token (client-side only)
    const getUserIdFromToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch {
            return null;
        }
    }, []);

    // Update user stats from leaderboard
    const updateUserStats = useCallback((entries: LeaderboardEntry[]) => {
        const userId = getUserIdFromToken();
        const userEntry = entries.find(e => e.userId === userId);
        if (userEntry) {
            setUserScore(userEntry.totalPoints);
            setUserRank(userEntry.rank);
        }
    }, []);

    // Connect to WebSocket
    useEffect(() => {
        if (!contestId) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please sign in to participate');
            router.push('/auth/signin');
            return;
        }

        let hasJoined = false;
        let hasSentInit = false;
        console.log('[WS] Connecting to:', WS_URL);
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] WebSocket connected, readyState:', ws.readyState);
            setWsConnected(true);
        };

        ws.onmessage = (event) => {
            console.log('[WS] Raw message received:', event.data);

            // Handle handshake message - then send init_contest
            if (event.data === 'ws handshake sucessfull') {
                console.log('[WS] Handshake received, sending init_contest...');
                if (!hasSentInit) {
                    hasSentInit = true;
                    const initMsg = JSON.stringify({
                        type: 'init_contest',
                        contestId: contestId
                    });
                    console.log('[WS] Sending:', initMsg);
                    ws.send(initMsg);
                }
                return;
            }

            try {
                const message = JSON.parse(event.data);
                console.log('[WS] Parsed message:', message);

                // Handle init_contest response - then join
                if (!hasJoined && (message.message === 'redis init was sucessfull' || message.error === 'solution already exist')) {
                    hasJoined = true;
                    console.log('[WS] Contest initialized, sending join_contest...');
                    const joinMsg = JSON.stringify({
                        type: 'join_contest',
                        contestId: contestId
                    });
                    console.log('[WS] Sending:', joinMsg);
                    ws.send(joinMsg);
                    return;
                }

                // Handle join_contest response - includes both new join and rejoin
                if ((message.message === 'sucessfully joined the contest' || message.message === 'User Rejoined the contest') && message.data) {
                    console.log('[WS] Joined/Rejoined contest! Data:', message.data);

                    // Set leaderboard
                    if (message.data.leaderbaord) {
                        const entries = transformLeaderboard(message.data.leaderbaord);
                        setLeaderboard(entries);
                        updateUserStats(entries);
                    }

                    // Set first question from randomQuestion
                    if (message.data.randomQuestion) {
                        console.log('[WS] Setting question:', message.data.randomQuestion);
                        setCurrentQuestion(message.data.randomQuestion);
                        setSelectedAnswer(null);
                    } else {
                        // No questions left - user already completed this quiz
                        console.log('[WS] No questions left - quiz already completed');
                        handleFinishContest();
                    }
                    return;
                }

                // Handle submit_answer correct response
                if (message.success && message.error === 'correct' && message.data) {
                    console.log('Correct answer! Data:', message.data);
                    toast.success('Correct answer! +10 points');
                    setIsSubmitting(false);
                    setAnsweredCount(prev => prev + 1);

                    // Update leaderboard
                    if (message.data.UpdatedLeaderBoard) {
                        const entries = transformLeaderboard(message.data.UpdatedLeaderBoard);
                        setLeaderboard(entries);
                        updateUserStats(entries);
                    }

                    // Set next question or complete
                    if (message.data.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                        setSelectedAnswer(null);
                    } else {
                        // No more questions - quiz complete
                        handleFinishContest();
                    }
                    return;
                }

                // Handle incorrect answer - now includes randomQuestion
                if (message.error === 'incorrect') {
                    console.log('Wrong answer! Data:', message.data);
                    toast('Wrong answer', { icon: '❌' });
                    setIsSubmitting(false);
                    setAnsweredCount(prev => prev + 1);

                    // Set next question or complete
                    if (message.data?.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                        setSelectedAnswer(null);
                    } else {
                        handleFinishContest();
                    }
                    return;
                }

                // Handle already submitted - silently show next question (no count increment)
                if (message.error === 'submission already exist') {
                    console.log('[WS] Duplicate question, showing next one');
                    setIsSubmitting(false);
                    if (message.data?.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                        setSelectedAnswer(null);
                    } else {
                        // No more questions - quiz complete
                        handleFinishContest();
                    }
                    return;
                }

                // Handle user already joined
                if (message.error === 'User already joined the contest') {
                    console.log('User already in contest');
                    return;
                }

                // Handle live leaderboard broadcast (from other users' correct submissions)
                if (message.UpdatedLeaderboard) {
                    console.log('[WS] Live leaderboard broadcast:', message.UpdatedLeaderboard);
                    const entries = transformLeaderboard(message.UpdatedLeaderboard);
                    setLeaderboard(entries);
                    updateUserStats(entries);
                    return;
                }

                console.log('Unhandled message:', message);

            } catch (e) {
                console.error('Failed to parse WS message:', e, 'Raw:', event.data);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsConnected(false);
        };

        ws.onclose = (event) => {
            console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);
            setWsConnected(false);
        };

        return () => {
            console.log('Cleaning up WebSocket...');
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'leave_contest' }));
            }
            ws.close();
        };
    }, [contestId, router, transformLeaderboard, updateUserStats]);

    // Fetch contest data (for metadata only - questions come via WS)
    useEffect(() => {
        async function fetchContest() {
            if (!contestId) return;
            const response = await api.getContest(contestId);
            if (response.success && response.data) {
                setContest(response.data);
                // Set total questions from MCQ array length
                setTotalQuestions(response.data.MCQ?.length || 0);
            } else {
                toast.error('Failed to load contest');
            }
            setIsLoading(false);
            startTimeRef.current = Date.now();
        }
        fetchContest();
    }, [contestId]);

    const handleSelectAnswer = (answer: MCQOption) => {
        if (isSubmitting) return;
        setSelectedAnswer(answer);
    };

    const handleFinishContest = () => {
        const endTime = Date.now();
        const taken = Math.floor((endTime - startTimeRef.current) / 1000);
        setTimeTaken(taken);
        setIsCompleted(true);
    };

    const handleSubmitAnswer = () => {
        if (!currentQuestion || !selectedAnswer || isSubmitting) return;

        setIsSubmitting(true);

        // Send answer via WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'submit_answer',
                contestId: contestId,
                questionId: currentQuestion.id,
                answer: selectedAnswer
            }));
        } else {
            toast.error('Connection lost. Please refresh.');
            setIsSubmitting(false);
        }
    };

    // userId is now from state set in useEffect

    // Timer is now based on contest.StartTime and contest.ContestTotalTime

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading contest...
                </div>
            </div>
        );
    }

    if (!contest) {
        return <div className="min-h-screen flex items-center justify-center">Contest not found</div>;
    }

    // Parse current question for display
    const parsedQuestion = currentQuestion
        ? parseQuestion(currentQuestion.question, currentQuestion.srNo)
        : null;

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-8">
                <div className="max-w-md w-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center space-y-6 shadow-xl">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Contest Completed!</h1>
                        <p className="text-[var(--text-secondary)]">Thanks for giving the test.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-[var(--border)]">
                        <div>
                            <p className="text-sm text-[var(--text-muted)] mb-1">Time Taken</p>
                            <p className="text-xl font-mono font-semibold text-[var(--text-primary)]">{formatTime(timeTaken)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-muted)] mb-1">Questions</p>
                            <p className="text-xl font-mono font-semibold text-[var(--text-primary)]">{answeredCount} / {totalQuestions}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-b border-[var(--border)]">
                        <div>
                            <p className="text-sm text-[var(--text-muted)] mb-1">Your Score</p>
                            <p className="text-2xl font-bold text-[var(--accent-primary)]">{userScore}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-muted)] mb-1">Your Rank</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">#{userRank || '-'}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href={`/contests/${contestId}/leaderboard`}>
                            <Button variant="primary" className="w-full">
                                View Full Leaderboard
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
            {/* Top Bar */}
            <header className="bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50">
                <div className="container max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Back + Title */}
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/contests/${contestId}`}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 -ml-2 rounded-lg hover:bg-[var(--bg-secondary)]"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-lg font-semibold text-[var(--text-primary)]">{contest.title}</h1>
                                    <span className="text-xs bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                                        <span className="live-dot" /> Live
                                    </span>
                                    {wsConnected ? (
                                        <Wifi className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <WifiOff className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {answeredCount} of {totalQuestions} answered
                                </p>
                            </div>
                        </div>

                        {/* Right: Timer */}
                        <Timer
                            startTime={contest.StartTime}
                            totalMinutes={contest.ContestTotalTime || 60}
                            onTimeUp={handleFinishContest}
                        />
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-[var(--bg-elevated)]">
                <div
                    className="h-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 container max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Question Section */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {currentQuestion && parsedQuestion ? (
                            <>
                                <QuestionCard
                                    questionNumber={answeredCount + 1}
                                    totalQuestions={totalQuestions}
                                    question={parsedQuestion.question}
                                    options={parsedQuestion.options}
                                    selectedAnswer={selectedAnswer || undefined}
                                    onSelectAnswer={handleSelectAnswer}
                                    points={currentQuestion.points}
                                    avgTime={currentQuestion.avgTTinMins}
                                    isSubmitted={false}
                                />

                                {/* Submit Button - Only action available */}
                                <div className="flex items-center justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmitAnswer}
                                        disabled={!selectedAnswer || isSubmitting}
                                        leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                    </Button>
                                </div>

                                {/* Info notice */}
                                <div className="text-center text-sm text-[var(--text-muted)] py-4 border-t border-[var(--border)]">
                                    Questions are delivered randomly. You cannot go back after submitting.
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                <p>Waiting for question...</p>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-semibold text-[var(--text-primary)]">Leaderboard</h2>
                                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                                        LIVE
                                    </span>
                                </div>
                                <Link
                                    href={`/contests/${contestId}/leaderboard`}
                                    className="text-xs text-[var(--accent-primary)] hover:underline font-medium"
                                >
                                    View All →
                                </Link>
                            </div>

                            {leaderboard.length > 0 ? (
                                <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                                    {leaderboard.map((entry, idx) => {
                                        const isMe = entry.userId === userId;
                                        const displayName = entry.userName.length > 12
                                            ? entry.userName.slice(0, 12) + '…'
                                            : entry.userName;

                                        return (
                                            <div
                                                key={entry.userId}
                                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${isMe
                                                    ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                                                    : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)]'
                                                    }`}
                                            >
                                                {/* Rank Badge */}
                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${idx === 0 ? 'bg-yellow-500 text-black' :
                                                    idx === 1 ? 'bg-gray-400 text-black' :
                                                        idx === 2 ? 'bg-amber-600 text-white' :
                                                            'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'
                                                    }`}>
                                                    {idx + 1}
                                                </div>

                                                {/* Name */}
                                                <span className={`flex-1 text-sm font-medium truncate ${isMe ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                                                    }`}>
                                                    {displayName}
                                                    {isMe && <span className="text-[10px] ml-1 opacity-60">(You)</span>}
                                                </span>

                                                {/* Score */}
                                                <span className="font-mono font-bold text-sm text-[var(--text-primary)] shrink-0">
                                                    {entry.totalPoints}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-[var(--text-muted)] text-sm bg-[var(--bg-elevated)] rounded-lg border border-dashed border-[var(--border)]">
                                    {wsConnected ? 'Waiting for participants...' : 'Connecting...'}
                                </div>
                            )}
                        </div>

                        {/* Your Stats */}
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">Your Performance</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{userScore}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Score</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                                    <p className="text-2xl font-bold text-[var(--accent-primary)]">#{userRank || '-'}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Rank</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
