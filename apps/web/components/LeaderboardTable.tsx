'use client';

import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    totalPoints: number;
    previousRank?: number;
    isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    showTrend?: boolean;
}

export function LeaderboardTable({ entries, currentUserId, showTrend = true }: LeaderboardTableProps) {
    const getRankChange = (current: number, previous?: number) => {
        if (!previous) return null;
        if (current < previous) return { direction: 'up', amount: previous - current };
        if (current > previous) return { direction: 'down', amount: current - previous };
        return { direction: 'same', amount: 0 };
    };

    const getMedalIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
        return null;
    };

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-default">
                            <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                Rank
                            </th>
                            <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                Player
                            </th>
                            <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                Points
                            </th>
                            {showTrend && (
                                <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                    Trend
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => {
                            const isCurrentUser = entry.userId === currentUserId || entry.isCurrentUser;
                            const rankChange = getRankChange(entry.rank, entry.previousRank);

                            return (
                                <tr
                                    key={entry.userId}
                                    className={cn(
                                        'border-b border-default transition-colors',
                                        isCurrentUser
                                            ? 'bg-accent-primary/5'
                                            : 'hover:bg-glass'
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getMedalIcon(entry.rank) || (
                                                <span className="w-5 text-center font-mono text-muted">
                                                    {entry.rank}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                                                {entry.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    'font-medium',
                                                    isCurrentUser ? 'text-accent-primary' : 'text-primary'
                                                )}>
                                                    {entry.userName}
                                                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono font-semibold text-primary">
                                            {entry.totalPoints.toLocaleString()}
                                        </span>
                                        <span className="text-muted ml-1">pts</span>
                                    </td>
                                    {showTrend && (
                                        <td className="px-6 py-4 text-right">
                                            {rankChange && (
                                                <div className={cn(
                                                    'inline-flex items-center gap-1',
                                                    rankChange.direction === 'up' && 'text-green-400',
                                                    rankChange.direction === 'down' && 'text-red-400',
                                                    rankChange.direction === 'same' && 'text-muted'
                                                )}>
                                                    {rankChange.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                                                    {rankChange.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                                                    {rankChange.direction === 'same' && <Minus className="w-4 h-4" />}
                                                    {rankChange.amount > 0 && (
                                                        <span className="text-sm font-medium">{rankChange.amount}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
