'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    totalPoints: number;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export default function LeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const contestId = params.id as string;

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get user ID from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.userId);
            } catch { }
        }
    }, []);

    // Transform leaderboard data
    const transformLeaderboard = useCallback((data: { value: string; score: number }[]) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((entry, idx) => ({
            rank: idx + 1,
            userId: entry.value,
            userName: entry.value,
            totalPoints: entry.score,
        }));
    }, []);

    // Fetch leaderboard via WebSocket (one-shot)
    const fetchLeaderboard = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/signin');
            return;
        }

        setIsRefreshing(true);
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            // Wait for handshake then send init + join
        };

        ws.onmessage = (event) => {
            if (event.data === 'ws handshake sucessfull') {
                ws.send(JSON.stringify({ type: 'init_contest', contestId }));
                return;
            }

            try {
                const message = JSON.parse(event.data);

                // After init, send join
                if (message.message === 'redis init was sucessfull' || message.error === 'solution already exist') {
                    ws.send(JSON.stringify({ type: 'join_contest', contestId }));
                    return;
                }

                // Got the leaderboard from join response
                if ((message.message === 'sucessfully joined the contest' || message.message === 'User Rejoined the contest') && message.data?.leaderbaord) {
                    setLeaderboard(transformLeaderboard(message.data.leaderbaord));
                    setIsLoading(false);
                    setIsRefreshing(false);
                    ws.close();
                }
            } catch (e) {
                console.error('WS parse error:', e);
            }
        };

        ws.onerror = () => {
            setIsLoading(false);
            setIsRefreshing(false);
        };

        ws.onclose = () => {
            setIsRefreshing(false);
        };

        // Timeout fallback
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            setIsLoading(false);
            setIsRefreshing(false);
        }, 10000);
    }, [contestId, router, transformLeaderboard]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return (
        <div className="container max-w-3xl py-8">
            {/* Back Link */}
            <Link
                href={`/contests/${contestId}/live`}
                className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Contest
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">
                        Full Leaderboard
                    </h1>
                    <p className="text-sm text-muted">
                        {leaderboard.length} participants
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchLeaderboard}
                    disabled={isRefreshing}
                    leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                >
                    Refresh
                </Button>
            </div>

            {/* Leaderboard */}
            <div className="bg-card rounded-2xl border border-default overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center text-muted">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                        Loading leaderboard...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="py-20 text-center text-muted">
                        No participants yet
                    </div>
                ) : (
                    <div className="divide-y divide-default">
                        {leaderboard.map((entry, idx) => {
                            const isMe = entry.userId === currentUserId;
                            const displayName = entry.userName.length > 20
                                ? entry.userName.slice(0, 20) + '…'
                                : entry.userName;

                            return (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${isMe
                                            ? 'bg-accent-primary/10'
                                            : 'hover:bg-elevated'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 ${idx === 0 ? 'bg-yellow-500 text-black' :
                                            idx === 1 ? 'bg-gray-400 text-black' :
                                                idx === 2 ? 'bg-amber-600 text-white' :
                                                    'bg-elevated text-muted border border-default'
                                        }`}>
                                        {idx < 3 ? <Trophy className="w-5 h-5" /> : idx + 1}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${isMe ? 'text-accent-primary' : 'text-primary'
                                            }`}>
                                            {displayName}
                                            {isMe && <span className="text-xs ml-2 opacity-60">(You)</span>}
                                        </p>
                                        {idx < 3 && (
                                            <p className="text-xs text-muted">
                                                {idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Score */}
                                    <div className="text-right shrink-0">
                                        <span className="font-mono font-bold text-lg text-primary">
                                            {entry.totalPoints}
                                        </span>
                                        <span className="text-sm text-muted ml-1">pts</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
