'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Send, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { api } from '@/lib/api';
import type { Contest, MCQ, MCQOption } from '@/lib/types';
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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, MCQOption>>({});
    const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
    const [isCompleted, setIsCompleted] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const [timeTaken, setTimeTaken] = useState(0);

    // WebSocket state
    const wsRef = useRef<WebSocket | null>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userScore, setUserScore] = useState(0);
    const [userRank, setUserRank] = useState<number | null>(null);
    const previousLeaderboardRef = useRef<Map<string, number>>(new Map());

    // Transform backend leaderboard format to frontend format
    const transformLeaderboard = useCallback((data: { value: string; score: number }[]) => {
        const prevRanks = previousLeaderboardRef.current;
        const newEntries: LeaderboardEntry[] = data.map((entry, idx) => ({
            rank: idx + 1,
            userId: entry.value,
            userName: entry.value, // Backend uses userId as value
            totalPoints: entry.score,
            previousRank: prevRanks.get(entry.value),
        }));

        // Update previous ranks for next update
        const newPrevRanks = new Map<string, number>();
        newEntries.forEach(e => newPrevRanks.set(e.userId, e.rank));
        previousLeaderboardRef.current = newPrevRanks;

        return newEntries;
    }, []);

    // Get current user ID from token
    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch {
            return null;
        }
    };

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
        console.log('[WS] Connecting to:', WS_URL);
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected, sending init_contest...');
            setWsConnected(true);

            // First initialize the contest (caches solutions in Redis)
            const initMsg = JSON.stringify({
                type: 'init_contest',
                contestId: contestId
            });
            console.log('Sending:', initMsg);
            ws.send(initMsg);
        };

        ws.onmessage = (event) => {
            console.log('Raw WS message received:', event.data);

            // Skip non-JSON handshake message
            if (event.data === 'ws handshake sucessfull') {
                console.log('WS handshake received, waiting for init_contest response...');
                return;
            }

            try {
                const message = JSON.parse(event.data);
                console.log('Parsed WS Message:', message);

                // Handle init_contest response - then join (only once)
                if (!hasJoined && (message.message === 'redis init was sucessfull' || message.error === 'solution already exist')) {
                    hasJoined = true;
                    console.log('[WS] Contest initialized, sending join_contest...');
                    ws.send(JSON.stringify({
                        type: 'join_contest',
                        contestId: contestId
                    }));
                    return;
                }

                // Handle join_contest response
                if (message.message === 'sucessfully joined the contest' && message.data) {
                    console.log('Joined contest! Leaderboard data:', message.data);
                    const entries = message.data.map((entry: { value: string; score: number }, idx: number) => ({
                        rank: idx + 1,
                        userId: entry.value,
                        userName: entry.value,
                        totalPoints: entry.score,
                    }));
                    setLeaderboard(entries);

                    const userId = getUserIdFromToken();
                    const userEntry = entries.find((e: LeaderboardEntry) => e.userId === userId);
                    if (userEntry) {
                        setUserScore(userEntry.totalPoints);
                        setUserRank(userEntry.rank);
                    }
                    return;
                }

                // Handle submit_answer correct response
                if (message.success && message.error === 'correct' && message.data) {
                    console.log('Correct answer! Updated leaderboard:', message.data);
                    toast.success('Correct answer! +10 points');
                    const entries = message.data.map((entry: { value: string; score: number }, idx: number) => ({
                        rank: idx + 1,
                        userId: entry.value,
                        userName: entry.value,
                        totalPoints: entry.score,
                    }));
                    setLeaderboard(entries);

                    const userId = getUserIdFromToken();
                    const userEntry = entries.find((e: LeaderboardEntry) => e.userId === userId);
                    if (userEntry) {
                        setUserScore(userEntry.totalPoints);
                        setUserRank(userEntry.rank);
                    }
                    return;
                }

                // Handle incorrect answer
                if (message.error === 'incorrect') {
                    toast('Wrong answer', { icon: '❌' });
                    return;
                }

                // Handle already submitted
                if (message.error === 'submission already exist') {
                    toast.error('Already submitted this question');
                    return;
                }

                // Handle user already joined
                if (message.error === 'User already joined the contest') {
                    console.log('User already in contest');
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
    }, [contestId, router]);

    // Fetch contest data
    useEffect(() => {
        async function fetchContest() {
            if (!contestId) return;
            const response = await api.getContest(contestId);
            if (response.success && response.data) {
                setContest(response.data);
            } else {
                toast.error('Failed to load contest');
            }
            setIsLoading(false);
            startTimeRef.current = Date.now();
        }
        fetchContest();
    }, [contestId]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading contest...</div>;
    }

    if (!contest) {
        return <div className="min-h-screen flex items-center justify-center">Contest not found</div>;
    }

    const mcqQuestions = (contest.MCQ || []).sort((a, b) => a.srNo - b.srNo);
    const totalQuestions = mcqQuestions.length;
    const currentQuestionData = mcqQuestions[currentQuestionIndex];
    const totalDurationSeconds = mcqQuestions.reduce((acc, q) => acc + ((q.avgTTinMins || 2) * 60), 0);

    const parsedQuestion = currentQuestionData
        ? parseQuestion(currentQuestionData.question, currentQuestionData.srNo)
        : null;

    const handleSelectAnswer = (answer: MCQOption) => {
        if (!currentQuestionData || submittedQuestions.has(currentQuestionData.id)) return;
        setAnswers({ ...answers, [currentQuestionData.id]: answer });
    };

    const handleFinishContest = () => {
        const endTime = Date.now();
        const taken = Math.floor((endTime - startTimeRef.current) / 1000);
        setTimeTaken(taken);
        setIsCompleted(true);
    };

    const handleSubmitAnswer = () => {
        if (!currentQuestionData || !answers[currentQuestionData.id]) return;

        // Send answer via WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'submit_answer',
                contestId: contestId,
                questionId: currentQuestionData.id,
                answer: answers[currentQuestionData.id]
            }));
        } else {
            toast.error('Connection lost. Please refresh.');
            return;
        }

        const newSet = new Set(submittedQuestions);
        newSet.add(currentQuestionData.id);
        setSubmittedQuestions(newSet);

        // Auto advance
        setTimeout(() => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                handleFinishContest();
            }
        }, 800);
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const userId = getUserIdFromToken();

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
                            <p className="text-sm text-[var(--text-muted)] mb-1">Total Time</p>
                            <p className="text-xl font-mono font-semibold text-[var(--text-primary)]">{formatTime(totalDurationSeconds)}</p>
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
            <header className="bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50 shadow-sm">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/contests/${contestId}`}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 -ml-2 rounded-lg hover:bg-[var(--bg-secondary)]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-semibold text-[var(--text-primary)] leading-tight">{contest.title}</h1>
                                {wsConnected ? (
                                    <Wifi className="w-4 h-4 text-green-500" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>
                    <Timer initialSeconds={totalDurationSeconds} onTimeUp={handleFinishContest} />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Question Section */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {parsedQuestion ? (
                            <>
                                <QuestionCard
                                    questionNumber={currentQuestionIndex + 1}
                                    totalQuestions={totalQuestions}
                                    question={parsedQuestion.question}
                                    options={parsedQuestion.options}
                                    selectedAnswer={answers[currentQuestionData.id]}
                                    onSelectAnswer={handleSelectAnswer}
                                    points={currentQuestionData.points}
                                    avgTime={currentQuestionData.avgTTinMins}
                                    isSubmitted={submittedQuestions.has(currentQuestionData.id)}
                                />

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-auto">
                                    <Button
                                        variant="secondary"
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0}
                                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                                    >
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        {!submittedQuestions.has(currentQuestionData.id) && answers[currentQuestionData.id] && (
                                            <Button
                                                variant="primary"
                                                onClick={handleSubmitAnswer}
                                                leftIcon={<Send className="w-4 h-4" />}
                                            >
                                                {currentQuestionIndex === totalQuestions - 1 ? 'Submit & Finish' : 'Submit Answer'}
                                            </Button>
                                        )}

                                        <Button
                                            variant="secondary"
                                            onClick={handleNext}
                                            disabled={currentQuestionIndex === totalQuestions - 1}
                                            rightIcon={<ChevronRight className="w-4 h-4" />}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>

                                {/* Question Navigator */}
                                <div className="border-t border-[var(--border)] pt-6 mt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {mcqQuestions.map((q, idx) => (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentQuestionIndex(idx)}
                                                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all shadow-sm ${idx === currentQuestionIndex
                                                    ? 'bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-secondary)]'
                                                    : submittedQuestions.has(q.id)
                                                        ? 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20'
                                                        : answers[q.id]
                                                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20'
                                                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                                No questions available in this contest.
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Live Leaderboard</h2>
                                <Link
                                    href={`/contests/${contestId}/leaderboard`}
                                    className="text-sm text-[var(--accent-primary)] hover:underline font-medium"
                                >
                                    Full View
                                </Link>
                            </div>

                            {leaderboard.length > 0 ? (
                                <LeaderboardTable
                                    entries={leaderboard.slice(0, 10)}
                                    currentUserId={userId || undefined}
                                    showTrend={true}
                                />
                            ) : (
                                <div className="py-8 text-center text-[var(--text-muted)] text-sm bg-[var(--bg-elevated)] rounded-xl border border-dashed border-[var(--border)]">
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
