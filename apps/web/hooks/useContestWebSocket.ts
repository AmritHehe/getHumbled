'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { LeaderboardEntry, MCQOption, WSQuestion } from '@/lib/types';
import toast from 'react-hot-toast';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

interface UseContestWebSocketReturn {
    wsConnected: boolean;
    currentQuestion: WSQuestion | null;
    leaderboard: LeaderboardEntry[];
    userScore: number;
    userRank: number | null;
    answeredCount: number;
    isCompleted: boolean;
    isSubmitting: boolean;
    timeTaken: number;
    submitAnswer: (answer: MCQOption) => void;
}

export function useContestWebSocket(contestId: string, totalQuestions: number): UseContestWebSocketReturn {
    const router = useRouter();
    const { user } = useAuth();

    // Question flow state
    const [currentQuestion, setCurrentQuestion] = useState<WSQuestion | null>(null);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Timing
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

    // Update user stats from leaderboard
    const updateUserStats = useCallback((entries: LeaderboardEntry[]) => {
        const userEntry = entries.find(e => e.userId === user?.id);
        if (userEntry) {
            setUserScore(userEntry.totalPoints);
            setUserRank(userEntry.rank);
        }
    }, [user?.id]);

    const handleFinishContest = useCallback(() => {
        const endTime = Date.now();
        const taken = Math.floor((endTime - startTimeRef.current) / 1000);
        setTimeTaken(taken);
        setIsCompleted(true);
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
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setWsConnected(true);
        };

        ws.onmessage = (event) => {
            // Handle handshake message — then send init_contest
            if (event.data === 'ws handshake sucessfull') {
                if (!hasSentInit) {
                    hasSentInit = true;
                    ws.send(JSON.stringify({ type: 'init_contest', contestId }));
                }
                return;
            }

            try {
                const message = JSON.parse(event.data);

                // Handle init_contest response — then join
                if (!hasJoined && (message.message === 'redis init was sucessfull' || message.error === 'solution already exist')) {
                    hasJoined = true;
                    ws.send(JSON.stringify({ type: 'join_contest', contestId }));
                    return;
                }

                // Handle join_contest response
                if ((message.message === 'sucessfully joined the contest' || message.message === 'User Rejoined the contest') && message.data) {
                    if (message.data.leaderbaord) {
                        const entries = transformLeaderboard(message.data.leaderbaord);
                        setLeaderboard(entries);
                        updateUserStats(entries);
                    }

                    if (message.data.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                    } else {
                        handleFinishContest();
                    }
                    return;
                }

                // Handle correct answer (new: isCorrect field)
                if (message.success && message.isCorrect === true && message.data) {
                    toast.success('Correct answer! +10 points');
                    setIsSubmitting(false);
                    setAnsweredCount(prev => prev + 1);

                    if (message.data.UpdatedLeaderBoard) {
                        const entries = transformLeaderboard(message.data.UpdatedLeaderBoard);
                        setLeaderboard(entries);
                        updateUserStats(entries);
                    }

                    if (message.data.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                    } else {
                        handleFinishContest();
                    }
                    return;
                }

                // Handle incorrect answer (new: isCorrect field)
                if (message.isCorrect === false) {
                    toast('Wrong answer');
                    setIsSubmitting(false);
                    setAnsweredCount(prev => prev + 1);

                    if (message.data?.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                    } else {
                        handleFinishContest();
                    }
                    return;
                }

                // Handle already submitted
                if (message.error === 'submission already exist') {
                    setIsSubmitting(false);
                    if (message.data?.randomQuestion) {
                        setCurrentQuestion(message.data.randomQuestion);
                    } else {
                        handleFinishContest();
                    }
                    return;
                }

                // Handle user already joined
                if (message.error === 'User already joined the contest') {
                    return;
                }

                // Handle live leaderboard broadcast
                if (message.UpdatedLeaderboard) {
                    const entries = transformLeaderboard(message.UpdatedLeaderboard);
                    setLeaderboard(entries);
                    updateUserStats(entries);
                    return;
                }

            } catch (e) {
                console.error('Failed to parse WS message:', e);
            }
        };

        ws.onerror = () => {
            setWsConnected(false);
        };

        ws.onclose = () => {
            setWsConnected(false);
        };

        startTimeRef.current = Date.now();

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'leave_contest' }));
            }
            ws.close();
        };
    }, [contestId, router, transformLeaderboard, updateUserStats, handleFinishContest]);

    const submitAnswer = useCallback((answer: MCQOption) => {
        if (!currentQuestion || isSubmitting) return;

        setIsSubmitting(true);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'submit_answer',
                contestId,
                questionId: currentQuestion.id,
                answer,
            }));
        } else {
            toast.error('Connection lost. Please refresh.');
            setIsSubmitting(false);
        }
    }, [currentQuestion, isSubmitting, contestId]);

    return {
        wsConnected,
        currentQuestion,
        leaderboard,
        userScore,
        userRank,
        answeredCount,
        isCompleted,
        isSubmitting,
        timeTaken,
        submitAnswer,
    };
}
