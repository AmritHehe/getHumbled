'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { LeaderboardEntry } from '@/lib/types';

interface LiveLeaderboardSidebarProps {
    contestId: string;
    leaderboard: LeaderboardEntry[];
    userScore: number;
    userRank: number | null;
    wsConnected: boolean;
}

export function LiveLeaderboardSidebar({
    contestId,
    leaderboard,
    userScore,
    userRank,
    wsConnected,
}: LiveLeaderboardSidebarProps) {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-default p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-primary">Leaderboard</h2>
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                            LIVE
                        </span>
                    </div>
                    <Link
                        href={`/contests/${contestId}/leaderboard`}
                        className="text-xs text-accent-primary hover:underline font-medium"
                    >
                        View All →
                    </Link>
                </div>

                {leaderboard.length > 0 ? (
                    <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                        {leaderboard.map((entry, idx) => {
                            const isMe = entry.userId === user?.id;
                            const displayName = entry.userName.length > 12
                                ? entry.userName.slice(0, 12) + '…'
                                : entry.userName;

                            return (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${isMe
                                        ? 'bg-accent-primary/10 border border-accent-primary/20'
                                        : 'bg-elevated hover:bg-surface-alt'
                                        }`}
                                >
                                    {/* Rank Badge */}
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${idx === 0 ? 'bg-yellow-500 text-black' :
                                        idx === 1 ? 'bg-gray-400 text-black' :
                                            idx === 2 ? 'bg-amber-600 text-white' :
                                                'bg-card text-muted border border-default'
                                        }`}>
                                        {idx + 1}
                                    </div>

                                    {/* Name */}
                                    <span className={`flex-1 text-sm font-medium truncate ${isMe ? 'text-accent-primary' : 'text-primary'
                                        }`}>
                                        {displayName}
                                        {isMe && <span className="text-[10px] ml-1 opacity-60">(You)</span>}
                                    </span>

                                    {/* Score */}
                                    <span className="font-mono font-bold text-sm text-primary shrink-0">
                                        {entry.totalPoints}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-6 text-center text-muted text-sm bg-elevated rounded-lg border border-dashed border-default">
                        {wsConnected ? 'Waiting for participants...' : 'Connecting...'}
                    </div>
                )}
            </div>

            {/* Your Stats */}
            <div className="bg-card rounded-2xl border border-default p-6 shadow-sm">
                <h3 className="text-sm font-medium text-muted mb-4">Your Performance</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-elevated">
                        <p className="text-2xl font-bold text-primary">{userScore}</p>
                        <p className="text-xs text-muted mt-1">Score</p>
                    </div>
                    <div className="p-3 rounded-xl bg-elevated">
                        <p className="text-2xl font-bold text-accent-primary">#{userRank || '-'}</p>
                        <p className="text-xs text-muted mt-1">Rank</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
