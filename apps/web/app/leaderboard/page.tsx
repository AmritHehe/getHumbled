'use client';

import React, { useState } from 'react';
import { Search, Trophy, Medal } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { LeaderboardTable } from '@/components/LeaderboardTable';

// Mock global leaderboard
const globalLeaderboard = [
    { rank: 1, userId: '1', userName: 'CodeMaster42', totalPoints: 15420, contestsWon: 12 },
    { rank: 2, userId: '2', userName: 'DevNinja', totalPoints: 14850, contestsWon: 10 },
    { rank: 3, userId: '3', userName: 'AlgoKing', totalPoints: 14200, contestsWon: 8 },
    { rank: 4, userId: '4', userName: 'ByteWizard', totalPoints: 13450, contestsWon: 7 },
    { rank: 5, userId: '5', userName: 'SwiftCoder', totalPoints: 12800, contestsWon: 6 },
    { rank: 6, userId: '6', userName: 'BinaryBoss', totalPoints: 12350, contestsWon: 5 },
    { rank: 7, userId: '7', userName: 'CacheQueen', totalPoints: 11900, contestsWon: 4 },
    { rank: 8, userId: '8', userName: 'LoopLord', totalPoints: 11500, contestsWon: 4 },
    { rank: 9, userId: '9', userName: 'FuncMaster', totalPoints: 11050, contestsWon: 3 },
    { rank: 10, userId: '10', userName: 'RecursiveRex', totalPoints: 10600, contestsWon: 3 },
    { rank: 11, userId: '11', userName: 'AsyncAce', totalPoints: 10150, contestsWon: 2 },
    { rank: 12, userId: '12', userName: 'PointerPro', totalPoints: 9700, contestsWon: 2 },
    { rank: 13, userId: '13', userName: 'HeapHelper', totalPoints: 9250, contestsWon: 1 },
    { rank: 14, userId: '14', userName: 'TreeTraverser', totalPoints: 8800, contestsWon: 1 },
    { rank: 15, userId: '15', userName: 'GraphGuru', totalPoints: 8350, contestsWon: 1 },
];

export default function GlobalLeaderboardPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLeaderboard = globalLeaderboard.filter((entry) =>
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Top 3 for podium display
    const top3 = globalLeaderboard.slice(0, 3);

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                    Global Leaderboard
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                    Top performers across all contests. Compete to climb the ranks!
                </p>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-4 mb-12">
                {/* 2nd Place */}
                <div className="text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl">
                        {top3[1]?.userName.charAt(0)}
                    </div>
                    <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-[var(--text-primary)]">{top3[1]?.userName}</p>
                    <p className="text-sm text-[var(--text-muted)]">{top3[1]?.totalPoints.toLocaleString()} pts</p>
                    <div className="w-20 md:w-28 h-24 bg-gradient-to-t from-gray-600/50 to-gray-500/30 rounded-t-xl mt-4 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-400">2</span>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-3 text-white font-bold text-3xl ring-4 ring-yellow-400/30">
                        {top3[0]?.userName.charAt(0)}
                    </div>
                    <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                    <p className="font-bold text-lg text-[var(--text-primary)]">{top3[0]?.userName}</p>
                    <p className="text-sm text-[var(--text-muted)]">{top3[0]?.totalPoints.toLocaleString()} pts</p>
                    <div className="w-24 md:w-32 h-32 bg-gradient-to-t from-yellow-600/50 to-yellow-500/30 rounded-t-xl mt-4 flex items-center justify-center">
                        <span className="text-4xl font-bold text-yellow-400">1</span>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl">
                        {top3[2]?.userName.charAt(0)}
                    </div>
                    <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="font-semibold text-[var(--text-primary)]">{top3[2]?.userName}</p>
                    <p className="text-sm text-[var(--text-muted)]">{top3[2]?.totalPoints.toLocaleString()} pts</p>
                    <div className="w-20 md:w-28 h-16 bg-gradient-to-t from-amber-700/50 to-amber-600/30 rounded-t-xl mt-4 flex items-center justify-center">
                        <span className="text-3xl font-bold text-amber-600">3</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex justify-center mb-8">
                <div className="w-full max-w-md">
                    <Input
                        placeholder="Search players..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
            </div>

            {/* Full Leaderboard */}
            <LeaderboardTable
                entries={filteredLeaderboard}
                showTrend={false}
            />
        </div>
    );
}
